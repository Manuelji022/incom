import { InvestmentSummary } from "@/components/investment-summary";
import { InvestmentSummaryCards } from "@/components/investment-summary-cards";
import { ProjectionChart } from "@/components/projection-chart";
import { ProjectionHeader } from "@/components/projection-header";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import type { ProjectionScenario } from "@/types/compound-interest";
import type { Currency } from "@/lib/currency";

type Dictionary = ReturnType<typeof getDictionary>;
type SummaryDictionary = Dictionary["summary"];
type SummaryText = { [Key in keyof SummaryDictionary]: string };

type ProjectionResultsProps = {
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
  selectedScenario,
  durationYears,
  locale,
  currency,
  text,
}: ProjectionResultsProps) {
  return (
    <section className="min-w-0 border-r border-border-subtle bg-page">
      <ProjectionHeader
        nominalBalance={selectedScenario.final_summary.nominal_balance}
        durationYears={durationYears}
        text={text.header}
        locale={locale}
        currency={currency}
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
