import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectionResults } from "@/features/compound-calculator/components/projection-results";
import { getDictionary } from "@/lib/i18n";
import type { ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";

vi.mock("@/features/compound-calculator/components/projection-chart", () => ({
  ProjectionChart: ({ text }: { text: { scenario: string } }) => <div data-testid="projection-chart">{text.scenario}</div>,
}));
vi.mock("@/features/compound-calculator/components/investment-summary", () => ({
  InvestmentSummary: ({ text }: { text: { title: string } }) => <div data-testid="annual-summary">{text.title}</div>,
}));

const dictionary = getDictionary("en");

function makeScenario(name: ProjectionScenario["name"], balance: string): ProjectionScenario {
  const point = {
    year: 10,
    nominal_balance: balance,
    initial_principal: "10000.00",
    cumulative_contributions: "0.00",
    cumulative_investment_growth: "40000.00",
    cumulative_fees_paid: "0.00",
    inflation_adjusted_balance: "35000.00",
  };

  return {
    name,
    annual_return_percent: "7",
    final_summary: {
      nominal_balance: balance,
      inflation_adjusted_balance: "35000.00",
      cumulative_fees_paid: "0.00",
    },
    annual_points: [point],
  };
}

describe("projection results", () => {
  it("keeps the selected scenario context on the headline, chart, schedule, and scenario controls", () => {
    const low = makeScenario("low", "50000.00");
    const expected = makeScenario("expected", "60000.00");
    const high = makeScenario("high", "70000.00");
    const onSelectScenario = vi.fn();

    render(<ProjectionResults
      isDesktop
      scenarios={[low, expected, high]}
      selectedName="low"
      onSelectScenario={onSelectScenario}
      compositionText={dictionary.composition}
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
    expect(screen.getByTestId("annual-summary").textContent).toContain(dictionary.scenarios.low);
    expect(screen.getAllByText(dictionary.summary.real)).toHaveLength(1);
    expect(screen.getByRole("button", { name: new RegExp(dictionary.scenarios.low) }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: new RegExp(dictionary.scenarios.high) }));
    expect(onSelectScenario).toHaveBeenCalledWith("high");
  });
});
