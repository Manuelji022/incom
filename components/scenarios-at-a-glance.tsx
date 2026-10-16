import type { ProjectionScenario } from "@/types/compound-interest";

type ScenariosAtAGlanceProps = {
  durationYears: number;
  scenarios: readonly ProjectionScenario[];
};

const scenarioLabels: Record<ProjectionScenario["name"], string> = {
  low: "Cautious",
  expected: "Expected",
  high: "Ambitious",
};

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-IE", {
  style: "percent",
  maximumFractionDigits: 1,
});

function formatPercent(value: string): string {
  return percent.format(Number(value) / 100);
}

export function ScenariosAtAGlance({
  durationYears,
  scenarios,
}: ScenariosAtAGlanceProps) {
  return (
    <aside
      aria-labelledby="scenarios-at-a-glance-title"
      className="border-t border-border-subtle bg-container px-3 py-8 lg:min-h-full lg:border-t-0 lg:border-l"
    >
      <section className="pt-2">
        <h2
          id="scenarios-at-a-glance-title"
          className="text-sm font-semibold leading-5 text-primary-foreground"
        >
          Scenarios at a glance
        </h2>
        <p className="mt-1 text-xs leading-4 text-secondary-foreground">
          Final portfolio value in {durationYears} years
        </p>

        {scenarios.length > 0 ? (
          <ul
            aria-label="Projected portfolio values by return scenario"
            className="mt-2 overflow-hidden rounded-lg border border-border-default"
          >
            {scenarios.map((scenario) => (
              <li
                key={scenario.name}
                className={`flex min-h-[3.0625rem] items-center justify-between gap-3 px-[0.6875rem] py-2 ${
                  scenario.name === "expected"
                    ? "border-l-2 border-brand-solid bg-brand-subtle"
                    : "border-l-2 border-transparent"
                } ${scenario.name !== "high" ? "border-b border-border-subtle" : ""}`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-4 text-primary-foreground">
                    {scenarioLabels[scenario.name]}
                  </p>
                  <p className="text-[11px] leading-4 text-secondary-foreground">
                    {formatPercent(scenario.annual_return_percent)} return
                  </p>
                </div>

                <div className="shrink-0 text-right tabular-nums">
                  <p className="text-xs font-semibold leading-4 text-primary-foreground">
                    {euro.format(Number(scenario.final_summary.nominal_balance))}
                  </p>
                  <p className="text-[11px] leading-4 text-secondary-foreground">
                    {euro.format(Number(scenario.final_summary.inflation_adjusted_balance))} real
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="mt-2 text-xs leading-5 text-secondary-foreground">
            Scenario results are temporarily unavailable.
          </p>
        )}
      </section>
    </aside>
  );
}
