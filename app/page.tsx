import { Header } from "@/components/header";
import { CompoundInputSidebar } from "@/components/compound-input-sidebar";
import { Footer } from "@/components/footer";
import { ProjectionHeader } from "@/components/projection-header";
import { ProjectionChart } from "@/components/projection-chart";
import { InvestmentSummary } from "@/components/investment-summary";
import { PortfolioComposition } from "@/components/portfolio-composition";
import { fetchProjection } from "@/lib/compound-interest";
import type { CompoundInterestProjectionResponse } from "@/types/compound-interest";

const defaultInputs = {
  initial_principal: "40000.00",
  recurring_contribution: {
    amount: "1000.00",
    frequency: "monthly" as const,
    timing: "end" as const,
    annual_increase_percent: "2",
  },
  duration_years: 25,
  expected_annual_return_percent: "7.8",
  annual_fee_percent: "0.05",
  expected_annual_inflation_percent: "2",
  scenario_range_percentage_points: "2",
};

async function getProjection(): Promise<CompoundInterestProjectionResponse | null> {
  try {
    return await fetchProjection(defaultInputs);
  } catch {
    return null;
  }
}

export default async function Home() {
  const projection = await getProjection();
  const expected = projection?.scenarios.find((scenario) => scenario.name === "expected");
  const expectedFinalPoint = expected?.annual_points.at(-1);
  return (
    <div className="flex min-h-svh flex-col bg-page">
      <Header />
      <main className="grid flex-1 grid-cols-1 lg:min-h-[65.125rem] lg:grid-cols-[18.25rem_minmax(0,1fr)_19.5rem]">
        <CompoundInputSidebar />
        <section className="min-w-0 border-r border-border-subtle bg-page">
          <ProjectionHeader
            nominalBalance={expected?.final_summary.nominal_balance}
            realBalance={expected?.final_summary.inflation_adjusted_balance}
            durationYears={projection?.resolved_inputs.duration_years ?? defaultInputs.duration_years}
            inflationPercent={projection?.resolved_inputs.expected_annual_inflation_percent.value ?? defaultInputs.expected_annual_inflation_percent}
          />
          {expected && expectedFinalPoint ? (
            <>
              <ProjectionChart points={expected.annual_points} />
              <InvestmentSummary points={expected.annual_points} />
              <PortfolioComposition point={expectedFinalPoint} />
            </>
          ) : (
            <div role="status" className="border-b border-border-subtle px-6 py-16 text-center text-sm text-secondary-foreground sm:px-8">
              Projection results are temporarily unavailable. Please try again shortly.
            </div>
          )}
        </section>
        <div aria-hidden="true" className="hidden min-h-full lg:block" />
      </main>
      <Footer />
    </div>
  );
}
