import type {
  CompoundInterestProjectionResponse,
  ProjectionPoint,
  ProjectionScenario,
} from "@/types/compound-interest";

const DURATION_YEARS = 25;
const INITIAL_PRINCIPAL = 40_000;
const MONTHLY_CONTRIBUTION = 1_000;
const CONTRIBUTION_INCREASE = 0.02;
const INFLATION = 0.02;

function money(value: number): string {
  return value.toFixed(2);
}

function buildScenario(
  name: ProjectionScenario["name"],
  annualReturnPercent: number,
): ProjectionScenario {
  const annualPoints: ProjectionPoint[] = [];
  let balance = INITIAL_PRINCIPAL;
  let cumulativeContributions = 0;
  let contribution = MONTHLY_CONTRIBUTION;

  annualPoints.push({
    year: 0,
    nominal_balance: money(balance),
    initial_principal: money(INITIAL_PRINCIPAL),
    cumulative_contributions: money(0),
    cumulative_investment_growth: money(0),
    inflation_adjusted_balance: money(balance),
  });

  for (let year = 1; year <= DURATION_YEARS; year += 1) {
    const monthlyRate = Math.pow(1 + annualReturnPercent / 100, 1 / 12) - 1;
    for (let month = 0; month < 12; month += 1) {
      balance = balance * (1 + monthlyRate) + contribution;
      cumulativeContributions += contribution;
    }

    annualPoints.push({
      year,
      nominal_balance: money(balance),
      initial_principal: money(INITIAL_PRINCIPAL),
      cumulative_contributions: money(cumulativeContributions),
      cumulative_investment_growth: money(
        balance - INITIAL_PRINCIPAL - cumulativeContributions,
      ),
      inflation_adjusted_balance: money(
        balance / Math.pow(1 + INFLATION, year),
      ),
    });
    contribution *= 1 + CONTRIBUTION_INCREASE;
  }

  const finalPoint = annualPoints.at(-1);
  if (!finalPoint) {
    throw new Error("A projection must include its final year.");
  }

  return {
    name,
    annual_return_percent: annualReturnPercent.toFixed(1),
    final_summary: {
      nominal_balance: finalPoint.nominal_balance,
      inflation_adjusted_balance: finalPoint.inflation_adjusted_balance,
    },
    annual_points: annualPoints,
  };
}

export const mockProjection: CompoundInterestProjectionResponse = {
  resolved_inputs: {
    duration_years: DURATION_YEARS,
    expected_annual_inflation_percent: {
      value: (INFLATION * 100).toString(),
      source: "mock",
    },
  },
  scenarios: [
    buildScenario("low", 6),
    buildScenario("expected", 8),
    buildScenario("high", 10),
  ],
};
