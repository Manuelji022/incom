import type { ProblemDetail, TargetInput, TargetResponse } from "@/types/compound-interest-target";

const moneyPattern = /^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/;
const percentPattern = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]{1,4})?$/;
const outputPattern = /^-?\d+(?:\.\d+)?$/;
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
const frequency = (value: unknown) => value === "monthly" || value === "quarterly" || value === "annual";
const timing = (value: unknown) => value === "beginning" || value === "end";
const decimal = (value: unknown) => typeof value === "string" && outputPattern.test(value) && Number.isFinite(Number(value));

// Validate only input constraints; the backend alone solves contributions and schedules.
export function validateTargetInput(value: unknown): ProblemDetail["errors"] {
  if (!record(value)) return [{ field: "", reason: "Provide a JSON object." }];
  const errors: ProblemDetail["errors"] = [];
  const add = (field: string, reason: string) => errors.push({ field, reason });
  const allowed = ["target_amount", "target_basis", "initial_principal", "duration_years", "expected_annual_return_percent", "contribution_plan", "annual_fee_percent", "expected_annual_inflation_percent", "scenario_range_percentage_points"];
  for (const key of Object.keys(value)) if (!allowed.includes(key)) add(key, "This field is not supported.");
  for (const key of ["target_amount", "initial_principal"]) {
    const amount = value[key];
    if (typeof amount !== "string" || !moneyPattern.test(amount) || !Number.isFinite(Number(amount))) add(key, "Enter a non-negative decimal amount, using a dot for decimals.");
    else if (key === "target_amount" && !/[1-9]/.test(amount)) add(key, "Enter a target greater than zero.");
  }
  if (typeof value.duration_years !== "number" || !Number.isInteger(value.duration_years) || value.duration_years < 1 || value.duration_years > 100) add("duration_years", "Enter a whole number from 1 to 100.");
  if (value.target_basis !== undefined && value.target_basis !== "nominal" && value.target_basis !== "real") add("target_basis", "Choose nominal or today's purchasing power.");
  const checkPercent = (field: string, input: unknown, min: number, max: number, required = false) => {
    if (input === undefined && !required) return;
    if (typeof input !== "string" || !percentPattern.test(input) || !Number.isFinite(Number(input)) || Number(input) < min || Number(input) > max) add(field, `Enter a percentage from ${min} to ${max}, with at most four decimal places.`);
  };
  checkPercent("expected_annual_return_percent", value.expected_annual_return_percent, -50, 50, true);
  checkPercent("annual_fee_percent", value.annual_fee_percent, 0, 100);
  checkPercent("expected_annual_inflation_percent", value.expected_annual_inflation_percent, -10, 100, value.target_basis === "real");
  checkPercent("scenario_range_percentage_points", value.scenario_range_percentage_points, 0, 50);
  const range = Number(value.scenario_range_percentage_points ?? "2");
  const expected = Number(value.expected_annual_return_percent);
  if (Number.isFinite(range) && Number.isFinite(expected) && (expected - range < -50 || expected + range > 50)) add("scenario_range_percentage_points", "Keep both scenario returns between -50% and 50%. Reduce the range or change the expected return.");
  const plan = value.contribution_plan;
  if (!record(plan)) add("contribution_plan.frequency", "Choose a contribution frequency.");
  else {
    for (const key of Object.keys(plan)) if (!["frequency", "timing", "annual_increase_percent"].includes(key)) add(`contribution_plan.${key}`, "This field is not supported.");
    if (!frequency(plan.frequency)) add("contribution_plan.frequency", "Choose monthly, quarterly or annual contributions.");
    if (plan.timing !== undefined && !timing(plan.timing)) add("contribution_plan.timing", "Choose beginning or end of period.");
    checkPercent("contribution_plan.annual_increase_percent", plan.annual_increase_percent, -10, 100);
  }
  return errors;
}

export function targetInputFromForm(values: FormData): TargetInput {
  const read = (key: string) => String(values.get(key) ?? "").trim();
  const input: TargetInput = {
    target_amount: read("target_amount"),
    initial_principal: read("initial_principal"),
    duration_years: Number(read("duration_years")),
    expected_annual_return_percent: read("expected_annual_return_percent"),
    contribution_plan: { frequency: read("contribution_plan.frequency") as TargetInput["contribution_plan"]["frequency"] },
  };
  if (read("target_basis") === "real") input.target_basis = "real";
  if (read("contribution_plan.timing") === "beginning") input.contribution_plan.timing = "beginning";
  const increase = read("contribution_plan.annual_increase_percent");
  if (increase !== "") input.contribution_plan.annual_increase_percent = increase;
  for (const key of ["annual_fee_percent", "expected_annual_inflation_percent", "scenario_range_percentage_points"] as const) {
    const value = read(key);
    if (value !== "") input[key] = value;
  }
  return input;
}

export class TargetApiError extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.detail);
    this.name = "TargetApiError";
  }
}
export function targetProblem(status: number, detail: string, errors: ProblemDetail["errors"] = []): ProblemDetail {
  return { type: "about:blank", title: status === 422 ? "Invalid target inputs" : "Target calculation failed", status, detail, instance: "/api/compound-interest/targets", code: status === 422 ? "VALIDATION_ERROR" : "TARGET_FAILED", errors };
}
function parseProblem(value: unknown, status: number): ProblemDetail {
  if (!record(value) || typeof value.detail !== "string" || typeof value.title !== "string" || typeof value.code !== "string") return targetProblem(status, "Unable to calculate your target. Please try again.");
  return {
    type: typeof value.type === "string" ? value.type : "about:blank",
    title: value.title, status, detail: value.detail,
    instance: typeof value.instance === "string" ? value.instance : "",
    code: value.code,
    errors: Array.isArray(value.errors) ? value.errors.filter((error): error is ProblemDetail["errors"][number] => record(error) && typeof error.field === "string" && typeof error.reason === "string") : [],
  };
}

export function parseTargetResponse(value: unknown): TargetResponse {
  const invalid = () => { throw new Error("invalid-response"); };
  if (!record(value) || !record(value.resolved_inputs) || !record(value.metadata)) return invalid();
  const inputs = value.resolved_inputs;
  const resolved = (item: unknown, valid: (value: unknown) => boolean = decimal) => record(item) && valid(item.value) && (item.source === "caller" || item.source === "server_default");
  if (!["target_amount", "nominal_target_amount", "initial_principal", "expected_annual_return_percent"].every((key) => decimal(inputs[key])) ||
      (inputs.target_basis !== "nominal" && inputs.target_basis !== "real") ||
      typeof inputs.duration_years !== "number" || !Number.isInteger(inputs.duration_years) || inputs.duration_years < 1 || inputs.duration_years > 100 ||
      !["annual_fee_percent", "expected_annual_inflation_percent", "scenario_range_percentage_points"].every((key) => resolved(inputs[key])) ||
      !record(inputs.contribution_plan) || !frequency(inputs.contribution_plan.frequency) || !resolved(inputs.contribution_plan.timing, timing) || !resolved(inputs.contribution_plan.annual_increase_percent)) return invalid();
  if (!["calculated_at", "calculation_model_version", "scenario_policy_version"].every((key) => typeof value.metadata === "object" && value.metadata !== null && typeof (value.metadata as Record<string, unknown>)[key] === "string") ||
      !Array.isArray(value.disclosures) || !value.disclosures.every((item) => typeof item === "string")) return invalid();
  const validValues = (item: unknown) => record(item) && ["nominal_balance", "initial_principal", "cumulative_contributions", "cumulative_investment_growth", "inflation_adjusted_balance", "cumulative_fees_paid", "fee_impact"].every((key) => decimal(item[key]));
  if (!Array.isArray(value.scenarios) || value.scenarios.length !== 3) return invalid();
  for (const [index, scenario] of value.scenarios.entries()) {
    if (!record(scenario) || scenario.name !== ["low", "expected", "high"][index] || !decimal(scenario.annual_return_percent) ||
        typeof scenario.required_contribution_amount !== "string" || !moneyPattern.test(scenario.required_contribution_amount) || !decimal(scenario.required_contribution_amount) ||
        !validValues(scenario.final_summary) || !Array.isArray(scenario.annual_points) || scenario.annual_points.length !== inputs.duration_years + 1 ||
        !scenario.annual_points.every((point, year) => record(point) && point.year === year && validValues(point) && decimal(point.contributions_during_year) && decimal(point.fees_during_year))) return invalid();
  }
  // Keep the API's decimal strings and metadata intact after validating the shape.
  return value as TargetResponse;
}

export async function fetchTarget(input: TargetInput, endpoint = "/api/compound-interest/targets"): Promise<TargetResponse> {
  const response = await fetch(endpoint, {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, application/problem+json" },
    body: JSON.stringify(input), signal: AbortSignal.timeout(30_000), cache: "no-store",
  });
  let body: unknown;
  try { body = await response.json(); } catch { throw new Error("invalid-response"); }
  if (!response.ok) throw new TargetApiError(parseProblem(body, response.status));
  return parseTargetResponse(body);
}
