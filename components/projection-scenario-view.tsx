"use client";

import { Fragment, useState } from "react";
import { InsightsSidebar } from "@/components/insights-sidebar";
import { ProjectionResults } from "@/components/projection-results";
import { mockProjection } from "@/lib/mock-projection";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import type { ProjectionScenario } from "@/types/compound-interest";

type Dictionary = ReturnType<typeof getDictionary>;
type ScenarioName = ProjectionScenario["name"];
type CompositionDictionary = Dictionary["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };

type ProjectionScenarioViewProps = {
  locale: Locale;
  text: Pick<Dictionary, "header" | "chart" | "summary" | "scenarios"> & {
    composition: CompositionText;
  };
};

export function ProjectionScenarioView({
  locale,
  text,
}: ProjectionScenarioViewProps) {
  const [selectedName, setSelectedName] = useState<ScenarioName>("expected");
  const selectedScenario = mockProjection.scenarios.find(
    (scenario) => scenario.name === selectedName,
  );
  const scenarioLabel = text.scenarios[selectedName];

  if (!selectedScenario) {
    return null;
  }

  return (
    <Fragment>
      <ProjectionResults
        selectedScenario={selectedScenario}
        durationYears={mockProjection.resolved_inputs.duration_years}
        inflationPercent={
          mockProjection.resolved_inputs.expected_annual_inflation_percent.value
        }
        locale={locale}
        text={{ ...text, scenarioLabel }}
      />
      <InsightsSidebar
        scenarios={mockProjection.scenarios}
        selectedScenario={selectedName}
        onSelectScenario={setSelectedName}
        durationYears={mockProjection.resolved_inputs.duration_years}
        locale={locale}
        text={{
          scenarios: text.scenarios,
          composition: text.composition,
        }}
      />
    </Fragment>
  );
}
