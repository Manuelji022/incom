import { PortfolioComposition } from "@/features/compound-calculator/components/portfolio-composition";
import { Scenarios } from "@/features/compound-calculator/components/scenarios";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import type { ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";
import type { Currency } from "@/lib/currency";

type Dictionary = ReturnType<typeof getDictionary>;
type CompositionDictionary = Dictionary["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };

type InsightsSidebarProps = {
  scenarios: readonly ProjectionScenario[];
  selectedScenario: ProjectionScenario;
  onSelectScenario: (scenario: ProjectionScenario["name"]) => void;
  durationYears: number;
  locale: Locale;
  currency: Currency;
  text: {
    scenarios: Dictionary["scenarios"];
    composition: CompositionText;
  };
};

export function InsightsSidebar({
  scenarios,
  selectedScenario,
  onSelectScenario,
  durationYears,
  locale,
  currency,
  text,
}: InsightsSidebarProps) {
  const scenarioLabel = text.scenarios[selectedScenario.name];

  return (
    <aside className="[container-type:inline-size] border-t border-border-subtle bg-container lg:min-h-full lg:border-t-0 lg:border-s">
      <Scenarios
        durationYears={durationYears}
        scenarios={scenarios}
        locale={locale}
        currency={currency}
        text={text.scenarios}
        selectedScenario={selectedScenario.name}
        onSelectScenario={onSelectScenario}
      />
      <PortfolioComposition
        point={selectedScenario.annual_points.at(-1)}
        locale={locale}
        currency={currency}
        text={{
          ...text.composition,
          subtitle: text.composition.subtitle.replace(
            "{scenario}",
            scenarioLabel,
          ),
        }}
      />
    </aside>
  );
}
