import type {
  CompoundInterestProjectionInput,
  CompoundInterestProjectionResponse,
  ProjectionPoint,
  ProjectionScenario,
} from "@/features/compound-calculator/types/compound-interest";

const projectionEndpoint =
  typeof window === "undefined"
    ? "https://incom-api.manuelji.dev/api/v1/compound-interest/projections"
    : "/api/compound-interest/projections";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMoney(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Number(value));
}

function parsePoint(value: unknown): ProjectionPoint | null {
  if (!isRecord(value)) return null;
  const { year, nominal_balance, initial_principal, cumulative_contributions,
    cumulative_investment_growth, cumulative_fees_paid, inflation_adjusted_balance } = value;
  if (typeof year !== "number" || !Number.isInteger(year) ||
      !isMoney(nominal_balance) || !isMoney(initial_principal) ||
      !isMoney(cumulative_contributions) || !isMoney(cumulative_investment_growth) ||
      !isMoney(cumulative_fees_paid) ||
      !isMoney(inflation_adjusted_balance)) return null;
  return { year, nominal_balance, initial_principal, cumulative_contributions,
    cumulative_investment_growth, cumulative_fees_paid, inflation_adjusted_balance };
}

function parseScenario(value: unknown): ProjectionScenario | null {
  if (!isRecord(value) || !isRecord(value.final_summary) || !Array.isArray(value.annual_points) || value.annual_points.length === 0) return null;
  const name = value.name;
  if (name !== "low" && name !== "expected" && name !== "high") return null;
  const points = value.annual_points.map(parsePoint);
  if (points.some((point) => point === null) || !isMoney(value.annual_return_percent) ||
      !isMoney(value.final_summary.nominal_balance) ||
      !isMoney(value.final_summary.cumulative_fees_paid) ||
      !isMoney(value.final_summary.inflation_adjusted_balance)) return null;
  return {
    name,
    annual_return_percent: value.annual_return_percent,
    final_summary: {
      nominal_balance: value.final_summary.nominal_balance,
      cumulative_fees_paid: value.final_summary.cumulative_fees_paid,
      inflation_adjusted_balance: value.final_summary.inflation_adjusted_balance,
    },
    annual_points: points.filter((point): point is ProjectionPoint => point !== null),
  };
}

export function parseProjectionResponse(value: unknown): CompoundInterestProjectionResponse {
  if (!isRecord(value) || !isRecord(value.resolved_inputs) ||
      !isRecord(value.resolved_inputs.expected_annual_inflation_percent) ||
      !Array.isArray(value.scenarios)) {
    throw new Error("invalid-response");
  }
  const inflation = value.resolved_inputs.expected_annual_inflation_percent;
  const scenarios = value.scenarios.map(parseScenario);
  if (typeof value.resolved_inputs.duration_years !== "number" ||
      !isMoney(inflation.value) || typeof inflation.source !== "string" ||
      scenarios.length !== 3 || scenarios.some((scenario) => scenario === null) ||
      new Set(scenarios.flatMap((scenario) => scenario ? [scenario.name] : [])).size !== 3) {
    throw new Error("invalid-response");
  }
  return {
    resolved_inputs: {
      duration_years: value.resolved_inputs.duration_years,
      expected_annual_inflation_percent: { value: inflation.value, source: inflation.source },
    },
    scenarios: scenarios.filter((scenario): scenario is ProjectionScenario => scenario !== null),
  };
}

export async function fetchProjection(
  input: CompoundInterestProjectionInput,
): Promise<CompoundInterestProjectionResponse> {
  const response = await fetch(projectionEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("rate-limited");
    throw new Error(response.status === 400 || response.status === 422 ? "invalid-input" : "projection-failed");
  }
  try {
    return parseProjectionResponse(await response.json());
  } catch {
    throw new Error("invalid-response");
  }
}
