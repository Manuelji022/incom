import { PortfolioComposition } from "@/components/portfolio-composition";
import { Scenarios } from "@/components/scenarios";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import type { ProjectionScenario } from "@/types/compound-interest";

type Dictionary = ReturnType<typeof getDictionary>;
type CompositionDictionary = Dictionary["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };

type InsightsSidebarProps = {
  scenarios: readonly ProjectionScenario[];
  selectedScenario: ProjectionScenario["name"];
  onSelectScenario: (scenario: ProjectionScenario["name"]) => void;
  durationYears: number;
  locale: Locale;
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
  text,
}: InsightsSidebarProps) {
  const selectedProjection = scenarios.find(
    (scenario) => scenario.name === selectedScenario,
  );
  const scenarioLabel = text.scenarios[selectedScenario];

  return (
    <aside className="border-t border-border-subtle bg-container lg:min-h-full lg:border-t-0 lg:border-l">
      <Scenarios
        durationYears={durationYears}
        scenarios={scenarios}
        locale={locale}
        text={text.scenarios}
        selectedScenario={selectedScenario}
        onSelectScenario={onSelectScenario}
      />
      <PortfolioComposition
        point={selectedProjection?.annual_points.at(-1)}
        locale={locale}
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
