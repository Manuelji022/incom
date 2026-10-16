export type ContributionFrequency = "monthly" | "quarterly" | "annual";

export type ContributionTiming = "beginning" | "end";

export type RecurringContributionInput = {
  amount: string;
  frequency: ContributionFrequency;
  timing?: ContributionTiming;
  annual_increase_percent?: string;
};

export type CompoundInterestProjectionInput = {
  initial_principal: string;
  recurring_contribution?: RecurringContributionInput;
  duration_years: number;
  expected_annual_return_percent: string;
  annual_fee_percent?: string;
  expected_annual_inflation_percent?: string;
  scenario_range_percentage_points?: string;
};

export type ProjectionPoint = {
  year: number;
  nominal_balance: string;
  initial_principal: string;
  cumulative_contributions: string;
  cumulative_investment_growth: string;
  inflation_adjusted_balance: string;
};

export type ProjectionScenario = {
  name: "low" | "expected" | "high";
  annual_return_percent: string;
  final_summary: Pick<ProjectionPoint, "nominal_balance" | "inflation_adjusted_balance">;
  annual_points: ProjectionPoint[];
};

export type CompoundInterestProjectionResponse = {
  resolved_inputs: {
    duration_years: number;
    expected_annual_inflation_percent: { value: string; source: string };
  };
  scenarios: ProjectionScenario[];
};
