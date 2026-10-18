import type { TargetResponse, TargetScenario, TargetPoint, TargetValues } from "@/features/compound-calculator/types/compound-interest-target";

const initialPrincipal = 10_000;
const targetAmount = 1_000_000;
const durationYears = 20;
const inflationPercent = 2.5;
const annualFeePercent = 0.08;
const contributionAmounts = { low: 2422.17, expected: 1913.76, high: 1494.07 } as const;
const returns = { low: 5, expected: 7, high: 9 } as const;
const sampleFinalValues: Record<keyof typeof returns, TargetValues> = {
  low: { nominal_balance: "1000001.13", initial_principal: "10000.00", cumulative_contributions: "581320.80", cumulative_investment_growth: "408680.33", inflation_adjusted_balance: "610271.64", cumulative_fees_paid: "6826.83", fee_impact: "9459.29" },
  expected: { nominal_balance: "1000001.00", initial_principal: "10000.00", cumulative_contributions: "459302.40", cumulative_investment_growth: "530698.60", inflation_adjusted_balance: "610271.55", cumulative_fees_paid: "6368.23", fee_impact: "9998.66" },
  high: { nominal_balance: "1000005.09", initial_principal: "10000.00", cumulative_contributions: "358576.80", cumulative_investment_growth: "631428.29", inflation_adjusted_balance: "610274.05", cumulative_fees_paid: "5938.03", fee_impact: "10528.18" },
};
const money = (value: number) => value.toFixed(2);

function buildScenario(name: keyof typeof returns): TargetScenario {
  const annualReturn = returns[name];
  const contribution = contributionAmounts[name];
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const monthlyFeeRate = annualFeePercent / 100 / 12;
  let balance = initialPrincipal;
  let balanceWithoutFees = initialPrincipal;
  let cumulativeContributions = 0;
  let cumulativeFees = 0;
  const annualPoints: TargetPoint[] = [];

  for (let year = 0; year <= durationYears; year += 1) {
    if (year > 0) {
      for (let month = 0; month < 12; month += 1) {
        balance += contribution;
        balanceWithoutFees += contribution;
        cumulativeContributions += contribution;
        const fee = balance * monthlyFeeRate;
        cumulativeFees += fee;
        balance -= fee;
        balance *= 1 + monthlyRate;
        balanceWithoutFees *= 1 + monthlyRate;
      }
    }
    const growth = balance - initialPrincipal - cumulativeContributions + cumulativeFees;
    const values: TargetValues = {
      nominal_balance: money(balance),
      initial_principal: money(initialPrincipal),
      cumulative_contributions: money(cumulativeContributions),
      cumulative_investment_growth: money(growth),
      inflation_adjusted_balance: money(balance / Math.pow(1 + inflationPercent / 100, year)),
      cumulative_fees_paid: money(cumulativeFees),
      fee_impact: money(balanceWithoutFees - balance),
    };
    annualPoints.push({
      ...values,
      year,
      contributions_during_year: money(year === 0 ? 0 : contribution * 12),
      fees_during_year: money(year === 0 ? 0 : cumulativeFees - Number(annualPoints.at(-1)?.cumulative_fees_paid ?? 0)),
    });
  }
  const finalPoint = { ...annualPoints.at(-1)!, ...sampleFinalValues[name], fees_during_year: name === "low" ? "770.31" : name === "expected" ? "766.30" : "762.02" };
  annualPoints[durationYears] = finalPoint;

  return {
    name,
    annual_return_percent: String(annualReturn),
    required_contribution_amount: money(contribution),
    final_summary: sampleFinalValues[name],
    annual_points: annualPoints,
  };
}

export const mockTarget: TargetResponse = {
  metadata: {
    calculated_at: "2026-10-18T10:38:23.500134Z",
    calculation_model_version: "compound-interest-v2",
    scenario_policy_version: "scenario-policy-v2",
  },
  resolved_inputs: {
    target_amount: money(targetAmount),
    target_basis: "nominal",
    nominal_target_amount: money(targetAmount),
    initial_principal: money(initialPrincipal),
    duration_years: durationYears,
    expected_annual_return_percent: "7",
    annual_fee_percent: { value: "0.08", source: "caller" },
    expected_annual_inflation_percent: { value: "2.5", source: "caller" },
    scenario_range_percentage_points: { value: "2", source: "caller" },
    contribution_plan: {
      frequency: "monthly",
      timing: { value: "end", source: "caller" },
      annual_increase_percent: { value: "0", source: "caller" },
    },
  },
  scenarios: [buildScenario("low"), buildScenario("expected"), buildScenario("high")],
};
