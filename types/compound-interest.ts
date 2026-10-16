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
