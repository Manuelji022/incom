import type { Locale } from "@/lib/locales";
import type { ProjectionScenario } from "@/types/compound-interest";

type ScenarioText = ReturnType<
  typeof import("@/lib/i18n").getDictionary
>["scenarios"];

type ScenariosAtAGlanceProps = {
  durationYears: number;
  scenarios: readonly ProjectionScenario[];
  locale: Locale;
  text: ScenarioText;
};

export function ScenariosAtAGlance({
  durationYears,
  scenarios,
  locale,
  text,
}: ScenariosAtAGlanceProps) {
  const formattingLocale = locale === "es" ? "es-ES" : "en-IE";
  const euro = new Intl.NumberFormat(formattingLocale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const percent = new Intl.NumberFormat(formattingLocale, {
    style: "percent",
    maximumFractionDigits: 1,
  });
  const duration = new Intl.NumberFormat(formattingLocale, {
    style: "unit",
    unit: "year",
    unitDisplay: "long",
  }).format(durationYears);

  const scenarioLabels = {
    low: text.low,
    expected: text.expected,
    high: text.high,
  } satisfies Record<ProjectionScenario["name"], string>;

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
          {text.title}
        </h2>
        <p className="mt-1 text-xs leading-4 text-secondary-foreground">
          {text.subtitle.replace("{duration}", duration)}
        </p>

        {scenarios.length > 0 ? (
          <ul
            aria-label={text.listLabel}
            className="mt-2 overflow-hidden rounded-lg border border-border-default"
          >
            {scenarios.map((scenario) => {
              const annualReturn = percent.format(
                Number(scenario.annual_return_percent) / 100,
              );
              const nominalBalance = euro.format(
                Number(scenario.final_summary.nominal_balance),
              );
              const realBalance = euro.format(
                Number(scenario.final_summary.inflation_adjusted_balance),
              );

              return (
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
                      {text.return.replace("{percent}", annualReturn)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right tabular-nums">
                    <p className="text-xs font-semibold leading-4 text-primary-foreground">
                      {nominalBalance}
                    </p>
                    <p className="text-[11px] leading-4 text-secondary-foreground">
                      {text.real.replace("{amount}", realBalance)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p
            role="status"
            className="mt-2 text-xs leading-5 text-secondary-foreground"
          >
            {text.unavailable}
          </p>
        )}
      </section>
    </aside>
  );
}
