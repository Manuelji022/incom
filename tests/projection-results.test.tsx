import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectionResults } from "@/features/compound-calculator/components/projection-results";
import { getDictionary } from "@/lib/i18n";
import type { ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";

vi.mock("@/features/compound-calculator/components/projection-chart", () => ({
  ProjectionChart: ({ text }: { text: { scenario: string } }) => <div data-testid="projection-chart">{text.scenario}</div>,
}));

const dictionary = getDictionary("en");

function makeScenario(name: ProjectionScenario["name"], balance: string): ProjectionScenario {
  const annualPoints = Array.from({ length: 11 }, (_, year) => ({
    year,
    nominal_balance: year === 10 ? balance : (10_000 + year * 5_000).toFixed(2),
    initial_principal: "10000.00",
    cumulative_contributions: (year * 1_000).toFixed(2),
    cumulative_investment_growth: (year * 4_000).toFixed(2),
    cumulative_fees_paid: (year * 10).toFixed(2),
    inflation_adjusted_balance: (10_000 + year * 4_500).toFixed(2),
  }));

  return {
    name,
    annual_return_percent: "7",
    final_summary: {
      nominal_balance: balance,
      inflation_adjusted_balance: "55000.00",
      cumulative_fees_paid: "100.00",
    },
    annual_points: annualPoints,
  };
}

describe("projection results", () => {
  it("shows one ordered layout with a focusable table containing every year", () => {
    const low = makeScenario("low", "50000.00");
    const expected = makeScenario("expected", "60000.00");
    const high = makeScenario("high", "70000.00");
    const onSelectScenario = vi.fn();

    render(<ProjectionResults
      scenarios={[low, expected, high]}
      selectedName="low"
      onSelectScenario={onSelectScenario}
      scenarioText={dictionary.scenarios}
      selectedScenario={low}
      durationYears={10}
      locale="en"
      currency="EUR"
      text={{
        header: dictionary.header,
        chart: dictionary.chart,
        summary: dictionary.summary,
        scenarioLabel: dictionary.scenarios.low,
      }}
    />);

    const portfolio = within(screen.getByRole("region", { name: dictionary.header.portfolio }));
    expect(portfolio.getByText("€50,000")).toBeTruthy();
    expect(screen.getByTestId("projection-chart").textContent).toContain(dictionary.scenarios.low);
    const selectedScenarioButton = screen.getByRole("button", { name: new RegExp(dictionary.scenarios.low) });
    expect(selectedScenarioButton.getAttribute("aria-pressed")).toBe("true");
    expect(selectedScenarioButton.className).toContain("sm:flex-col");
    expect(selectedScenarioButton.className).toContain("sm:items-start");
    expect(selectedScenarioButton.className).toContain("items-center");
    expect(selectedScenarioButton.className).toContain("justify-between");
    const scenarioList = screen.getByRole("list", { name: dictionary.scenarios.listLabel });
    expect(scenarioList.className).toContain("grid-cols-1");
    expect(scenarioList.className).toContain("sm:grid-cols-3");

    const summaryCards = document.querySelector('dl[aria-label="Final investment summary"]');
    if (!summaryCards) throw new Error("Expected the final investment summary cards");
    expect(summaryCards.querySelectorAll("dt")).toHaveLength(3);
    expect(summaryCards.textContent).not.toContain("Initial principal");
    expect(screen.queryByRole("heading", { name: "Portfolio composition" })).toBeNull();

    const tableRegion = screen.getByRole("region", { name: dictionary.summary.tableRegionLabel });
    const table = within(tableRegion).getByRole("table");
    expect(tableRegion.getAttribute("tabindex")).toBe("0");
    expect(tableRegion.className).toContain("max-h-[32rem]");
    expect(table.querySelector("thead")?.className).toContain("sticky");
    expect(within(table).getAllByRole("row")).toHaveLength(12);
    expect(within(table).getByRole("rowheader", { name: "0" })).toBeTruthy();
    expect(table.querySelector("thead th:first-child")?.className).toContain("ps-3");
    expect(table.querySelector("tbody th:first-child")?.className).toContain("ps-3");
    expect(table.querySelector("thead th:first-child")?.className).toContain("text-start");
    expect(table.querySelector("tbody th:first-child")?.className).toContain("text-start");
    expect(table.querySelector("thead th:last-child")?.className).toContain("pe-3");
    expect(table.querySelector("tbody td:last-child")?.className).toContain("pe-3");
    const finalYearRow = within(table).getByRole("rowheader", { name: "10" }).closest("tr");
    expect(finalYearRow?.className).toContain("bg-card");
    expect(finalYearRow?.className).toContain("font-semibold");
    expect(screen.getByText(dictionary.summary.columnHelp)).toBeTruthy();
    expect(screen.getByText(dictionary.summary.caption.replace("{scenario}", dictionary.scenarios.low))).toBeTruthy();

    const header = screen.getByRole("heading", { name: dictionary.header.portfolio });
    const scenarios = screen.getByRole("heading", { name: dictionary.scenarios.title });
    const cards = summaryCards;
    const chart = screen.getByTestId("projection-chart");
    const summary = screen.getByRole("heading", { name: dictionary.summary.title.replace("{scenario}", dictionary.scenarios.low) });
    const orderedNodes = [header, scenarios, cards, chart, summary];
    for (let index = 0; index < orderedNodes.length - 1; index += 1) {
      expect(orderedNodes[index].compareDocumentPosition(orderedNodes[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }

    fireEvent.click(screen.getByRole("button", { name: new RegExp(dictionary.scenarios.high) }));
    expect(onSelectScenario).toHaveBeenCalledWith("high");
  });
});
