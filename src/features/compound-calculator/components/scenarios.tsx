import type { Locale } from "@/lib/locales";
import type { ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import { getIntlLocale } from "@/lib/locales";

type ScenarioText = ReturnType<
  typeof import("@/lib/i18n").getDictionary
>["scenarios"];

type ScenariosProps = {
  durationYears: number;
  scenarios: readonly ProjectionScenario[];
  locale: Locale;
  currency: Currency;
  text: ScenarioText;
  selectedScenario: ProjectionScenario["name"];
  onSelectScenario: (scenario: ProjectionScenario["name"]) => void;
};

export function Scenarios({
  durationYears,
  scenarios,
  locale,
  currency,
  text,
  selectedScenario,
  onSelectScenario,
}: ScenariosProps) {
  const formattingLocale = getIntlLocale(locale);
  const formatter = getCurrencyFormatter(locale, currency, {
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
      className="px-4 py-4 lg:px-3"
    >
      <h2
        id="scenarios-at-a-glance-title"
        className="text-base font-semibold leading-6 text-primary-foreground"
      >
        {text.title}
      </h2>
      <p className="sr-only">
        {text.subtitle.replace("{duration}", duration)}
      </p>

      {scenarios.length > 0 ? (
        <ul
          aria-label={text.listLabel}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {scenarios.map((scenario) => {
            const annualReturn = percent.format(
              Number(scenario.annual_return_percent) / 100,
            );
            const nominalBalance = formatter.format(
              Number(scenario.final_summary.nominal_balance),
            );
            const realBalance = formatter.format(
              Number(scenario.final_summary.inflation_adjusted_balance),
            );
            const returnLabel = text.return.replace("{percent}", annualReturn);

            return (
              <li key={scenario.name}>
                <button
                  type="button"
                  aria-label={`${scenarioLabels[scenario.name]} · ${returnLabel} · ${text.nominal.replace("{amount}", nominalBalance)} · ${text.real.replace("{amount}", realBalance)}`}
                  aria-pressed={scenario.name === selectedScenario}
                  onClick={() => onSelectScenario(scenario.name)}
                  className={`flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-start transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-border-focus sm:flex-col sm:items-start sm:justify-start ${
                    scenario.name === selectedScenario
                      ? "border-2 border-brand-border-default bg-brand-subtle"
                      : "border-border-default bg-card hover:bg-component-hover"
                  }`}
                >
                  <span className="min-w-0 sm:w-full">
                    <span className="flex items-center gap-1.5 text-xs font-semibold leading-4 text-primary-foreground">
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${scenario.name === selectedScenario ? "border-brand-border-default bg-brand-foreground text-page" : "border-control-border bg-page text-transparent"}`}
                      >
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                          <path d="m2.5 6 2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {scenarioLabels[scenario.name]}
                    </span>
                    <span className="block text-xs leading-4 text-secondary-foreground">
                      {returnLabel}
                    </span>
                  </span>

                  <span className="min-w-0 text-end tabular-nums sm:w-full sm:text-start">
                    <span className="block text-xs font-semibold leading-4 text-primary-foreground [overflow-wrap:anywhere]">
                      {text.nominal.replace("{amount}", nominalBalance)}
                    </span>
                    <span className="block text-xs leading-4 text-secondary-foreground [overflow-wrap:anywhere]">
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
  );
}
