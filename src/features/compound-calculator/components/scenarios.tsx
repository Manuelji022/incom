import type { Locale } from "@/lib/locales";
import type { ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import { getIntlLocale } from "@/lib/locales";

type ScenarioText = ReturnType<
  typeof import("@/lib/i18n").getDictionary
>["scenarios"];

type ScenariosProps = {
  compact?: boolean;
  durationYears: number;
  scenarios: readonly ProjectionScenario[];
  locale: Locale;
  currency: Currency;
  text: ScenarioText;
  selectedScenario: ProjectionScenario["name"];
  onSelectScenario: (scenario: ProjectionScenario["name"]) => void;
};

export function Scenarios({
  compact = false,
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
      className={compact ? "px-4 py-4" : "px-4 py-5 lg:px-3 lg:py-8"}
    >
      <section className="pt-2">
        <h2
          id="scenarios-at-a-glance-title"
          className="text-base font-semibold leading-6 text-primary-foreground"
        >
          {text.title}
        </h2>
        <p className={compact ? "sr-only" : "mt-1 text-xs leading-4 text-secondary-foreground"}>
          {text.subtitle.replace("{duration}", duration)}
        </p>

        {scenarios.length > 0 ? (
          <ul
            aria-label={text.listLabel}
            className={compact ? "mt-3 grid grid-cols-3 gap-2" : "mt-2 overflow-hidden rounded-lg border border-border-default"}
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
              const returnLabel = compact
                ? annualReturn
                : text.return.replace("{percent}", annualReturn);

              return (
                <li
                  key={scenario.name}
                  className={`${!compact && scenario.name !== "high" ? "border-b border-border-subtle" : ""}`}
                >
                  <button
                    type="button"
                    aria-label={compact ? `${scenarioLabels[scenario.name]} · ${returnLabel} · ${nominalBalance}` : undefined}
                    aria-pressed={scenario.name === selectedScenario}
                    onClick={() => onSelectScenario(scenario.name)}
                    className={`${compact ? "flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-lg border px-1 py-3 text-center" : "flex min-h-[3.0625rem] w-full items-center justify-between gap-3 border-s-2 px-[0.6875rem] py-2 text-start"} transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-border-focus ${
                      scenario.name === selectedScenario
                        ? "border-brand-solid bg-brand-subtle"
                        : compact ? "border-border-default bg-card hover:bg-component-hover" : "border-transparent hover:bg-card"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold leading-4 text-primary-foreground">
                        {scenarioLabels[scenario.name]}
                      </span>
                      <span className="block text-xs leading-4 text-secondary-foreground">
                        {returnLabel}
                      </span>
                    </span>

                    <span className={compact ? "hidden" : "min-w-0 text-end tabular-nums"}>
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
