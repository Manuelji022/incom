import { Scenarios } from "@/features/compound-calculator/components/scenarios";
import { InvestmentSummary } from "@/features/compound-calculator/components/investment-summary";
import { InvestmentSummaryCards } from "@/features/compound-calculator/components/investment-summary-cards";
import { ProjectionChart } from "@/features/compound-calculator/components/projection-chart";
import { ProjectionHeader } from "@/features/compound-calculator/components/projection-header";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import type { ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";
import type { Currency } from "@/lib/currency";

type Dictionary = ReturnType<typeof getDictionary>;
type SummaryDictionary = Dictionary["summary"];
type SummaryText = { [Key in keyof SummaryDictionary]: string };

type ProjectionResultsProps = {
  scenarios: readonly ProjectionScenario[];
  selectedName: ProjectionScenario["name"];
  onSelectScenario: (name: ProjectionScenario["name"]) => void;
  scenarioText: Dictionary["scenarios"];
  selectedScenario: ProjectionScenario;
  durationYears: number;
  locale: Locale;
  currency: Currency;
  text: {
    header: Dictionary["header"];
    chart: Dictionary["chart"];
    summary: SummaryText;
    scenarioLabel: string;
  };
};

export function ProjectionResults({
  scenarios,
  selectedName,
  onSelectScenario,
  scenarioText,
  selectedScenario,
  durationYears,
  locale,
  currency,
  text,
}: ProjectionResultsProps) {
  return (
    <section className="projection-results-enter min-w-0 bg-page">
      <ProjectionHeader
        nominalBalance={selectedScenario.final_summary.nominal_balance}
        realBalance={selectedScenario.final_summary.inflation_adjusted_balance}
        realLabel={text.summary.real}
        durationYears={durationYears}
        text={text.header}
        locale={locale}
        currency={currency}
      />
      <Scenarios
        durationYears={durationYears}
        scenarios={scenarios}
        selectedScenario={selectedName}
        onSelectScenario={onSelectScenario}
        locale={locale}
        currency={currency}
        text={scenarioText}
      />
      <InvestmentSummaryCards
        point={selectedScenario.annual_points.at(-1)}
        cumulativeFeesPaid={selectedScenario.final_summary.cumulative_fees_paid}
        locale={locale}
        currency={currency}
        text={text.summary}
      />
      <ProjectionChart
        points={selectedScenario.annual_points}
        text={{
          ...text.chart,
          scenario: text.chart.scenario.replace("{scenario}", text.scenarioLabel),
          aria: text.chart.aria.replace("{scenario}", text.scenarioLabel),
        }}
        locale={locale}
        currency={currency}
      />
      <InvestmentSummary
        points={selectedScenario.annual_points}
        text={{
          ...text.summary,
          title: text.summary.title.replace("{scenario}", text.scenarioLabel),
          caption: text.summary.caption.replace(
            "{scenario}",
            text.scenarioLabel,
          ),
        }}
        locale={locale}
        currency={currency}
      />
    </section>
  );
}
