import { fetchProjection } from "@/features/compound-calculator/api/compound-interest";
import type { CompoundInterestProjectionInput, ContributionFrequency, ContributionTiming } from "@/features/compound-calculator/types/compound-interest";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseInput(value: unknown): CompoundInterestProjectionInput | null {
  if (!isRecord(value) || typeof value.initial_principal !== "string" ||
      typeof value.duration_years !== "number" || typeof value.expected_annual_return_percent !== "string") return null;
  const stringField = (key: string) => typeof value[key] === "string" ? value[key] : undefined;
  const contribution = value.recurring_contribution;
  if (contribution !== undefined && !isRecord(contribution)) return null;
  let recurringContribution: CompoundInterestProjectionInput["recurring_contribution"];
  if (isRecord(contribution)) {
    const amount = contribution.amount;
    const frequency = contribution.frequency;
    const timing = contribution.timing;
    if (typeof amount !== "string" || (frequency !== "monthly" && frequency !== "quarterly" && frequency !== "annual") ||
        (timing !== undefined && timing !== "beginning" && timing !== "end")) return null;
    recurringContribution = {
      amount,
      frequency: frequency satisfies ContributionFrequency,
      ...(timing === undefined ? {} : { timing: timing satisfies ContributionTiming }),
      ...(typeof contribution.annual_increase_percent === "string" ? { annual_increase_percent: contribution.annual_increase_percent } : {}),
    };
  }
  return {
    initial_principal: value.initial_principal,
    duration_years: value.duration_years,
    expected_annual_return_percent: value.expected_annual_return_percent,
    ...(recurringContribution === undefined ? {} : { recurring_contribution: recurringContribution }),
    ...(stringField("annual_fee_percent") === undefined ? {} : { annual_fee_percent: stringField("annual_fee_percent") }),
    ...(stringField("expected_annual_inflation_percent") === undefined ? {} : { expected_annual_inflation_percent: stringField("expected_annual_inflation_percent") }),
    ...(stringField("scenario_range_percentage_points") === undefined ? {} : { scenario_range_percentage_points: stringField("scenario_range_percentage_points") }),
  };
}

export async function handleProjectionRequest(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-request" }, { status: 400 });
  }
  const input = parseInput(body);
  if (!input) return Response.json({ error: "invalid-request" }, { status: 400 });

  try {
    return Response.json(await fetchProjection(input));
  } catch (error) {
    if (error instanceof Error && error.message === "invalid-input") {
      return Response.json({ error: "invalid-input" }, { status: 422 });
    }
    if (error instanceof Error && error.message === "rate-limited") {
      return Response.json({ error: "rate-limited" }, { status: 429 });
    }
    return Response.json({ error: "projection-failed" }, { status: 502 });
  }
}
