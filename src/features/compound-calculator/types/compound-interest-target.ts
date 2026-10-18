import type { ContributionFrequency, ContributionTiming, ProjectionPoint, ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";

export type TargetInput = {
  target_amount: string;
  target_basis?: "nominal" | "real";
  initial_principal: string;
  duration_years: number;
  expected_annual_return_percent: string;
  contribution_plan: {
    frequency: ContributionFrequency;
    timing?: ContributionTiming;
    annual_increase_percent?: string;
  };
  annual_fee_percent?: string;
  expected_annual_inflation_percent?: string;
  scenario_range_percentage_points?: string;
};

export type Money = string;
export type Percent = string;
export type ScenarioName = "low" | "expected" | "high";
export type InputSource = "caller" | "server_default";
export type DisclosureCode = "PROJECTION_NOT_GUARANTEE" | "TAXES_EXCLUDED" | "FEES_MODELED" | "RETURNS_ASSUMED_CONSTANT";

type Resolved<T = Percent> = { value: T; source: InputSource };
export type TargetValues = Omit<ProjectionPoint, "year"> & { fee_impact: string };
export type TargetPoint = TargetValues & { year: number; contributions_during_year: string; fees_during_year: string };
export type TargetScenario = Omit<ProjectionScenario, "name" | "final_summary" | "annual_points"> & {
  name: ScenarioName;
  required_contribution_amount: string;
  final_summary: TargetValues;
  annual_points: TargetPoint[];
};
export type TargetResponse = {
  metadata: { calculated_at: string; calculation_model_version: "compound-interest-v2"; scenario_policy_version: "scenario-policy-v2" };
  resolved_inputs: {
    target_amount: string;
    target_basis: "nominal" | "real";
    nominal_target_amount: string;
    initial_principal: string;
    duration_years: number;
    expected_annual_return_percent: string;
    annual_fee_percent: Resolved;
    expected_annual_inflation_percent: Resolved;
    scenario_range_percentage_points: Resolved;
    contribution_plan: {
      frequency: ContributionFrequency;
      timing: Resolved<ContributionTiming>;
      annual_increase_percent: Resolved;
    };
  };
  scenarios: TargetScenario[];
  disclosures: DisclosureCode[];
};
export type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  errors: { field: string; reason: string }[];
};
