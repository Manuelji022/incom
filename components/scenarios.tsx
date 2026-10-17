import type { Locale } from "@/lib/locales";
import type { ProjectionScenario } from "@/types/compound-interest";

type ScenarioText = ReturnType<
  typeof import("@/lib/i18n").getDictionary
>["scenarios"];

type ScenariosProps = {
  durationYears: number;
  scenarios: readonly ProjectionScenario[];
  locale: Locale;
  text: ScenarioText;
  selectedScenario: ProjectionScenario["name"];
  onSelectScenario: (scenario: ProjectionScenario["name"]) => void;
};

export function Scenarios({
  durationYears,
  scenarios,
  locale,
  text,
  selectedScenario,
  onSelectScenario,
}: ScenariosProps) {
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
    <section
      aria-labelledby="scenarios-at-a-glance-title"
      className="px-3 py-8"
    >
      <section className="pt-2">
        <h2
          id="scenarios-at-a-glance-title"
          className="text-base font-semibold leading-6 text-primary-foreground"
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
                  className={`${scenario.name !== "high" ? "border-b border-border-subtle" : ""}`}
                >
                  <button
                    type="button"
                    aria-pressed={scenario.name === selectedScenario}
                    onClick={() => onSelectScenario(scenario.name)}
                    className={`flex min-h-[3.0625rem] w-full items-center justify-between gap-3 border-s-2 px-[0.6875rem] py-2 text-start transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-border-focus ${
                      scenario.name === selectedScenario
                        ? "border-brand-solid bg-brand-subtle"
                        : "border-transparent hover:bg-card"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold leading-4 text-primary-foreground">
                        {scenarioLabels[scenario.name]}
                      </span>
                      <span className="block text-xs leading-4 text-secondary-foreground">
                        {text.return.replace("{percent}", annualReturn)}
                      </span>
                    </span>

                    <span className="min-w-0 text-end tabular-nums">
                      <span className="block break-words text-xs font-semibold leading-4 text-primary-foreground">
                        {nominalBalance}
                      </span>
                      <span className="block break-words text-xs leading-4 text-secondary-foreground">
                        {text.real.replace("{amount}", realBalance)}
                      </span>
                    </span>
                  </button>
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
    </section>
  );
}
