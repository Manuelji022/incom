import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompoundInputSidebar } from "@/features/compound-calculator/components/compound-input-sidebar";
import { ProjectionScenarioView } from "@/features/compound-calculator/components/projection-scenario-view";
import { getDictionary } from "@/lib/i18n";
import { getTargetText } from "@/features/compound-calculator/lib/target-i18n";

vi.mock("@/components/header", () => ({ Header: () => <div /> }));
vi.mock("@/features/compound-calculator/components/projection-chart", () => ({ ProjectionChart: () => <div /> }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function SidebarHarness() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <form>
      <CompoundInputSidebar
        text={getDictionary("en").sidebar}
        locale="en"
        submitting={false}
        calculatingLabel="Calculating"
        collapsed={false}
        onToggleCollapsed={vi.fn()}
        currency="EUR"
        onCurrencyChange={vi.fn()}
        advancedOpen={advancedOpen}
        onToggleAdvanced={() => setAdvancedOpen((open) => !open)}
      />
    </form>
  );
}

describe("compound input sidebar", () => {
  it("keeps advanced assumptions collapsed on desktop with an available disclosure", () => {
    render(<SidebarHarness />);
    const text = getDictionary("en").sidebar;

    const toggle = screen.getByRole("button", { name: text.openAssumptions });
    const advancedFields = document.getElementById("advanced-assumption-fields");

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.className).not.toContain("lg:hidden");
    expect(advancedFields?.hasAttribute("hidden")).toBe(true);

    const calculate = screen.getByRole("button", { name: text.calculate });
    expect(calculate.compareDocumentPosition(toggle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: text.closeAssumptions }).getAttribute("aria-expanded")).toBe("true");
    expect(advancedFields?.className).not.toContain("hidden");
    expect(advancedFields?.hasAttribute("hidden")).toBe(false);
    expect(screen.getAllByRole("button", { name: text.calculate })).toHaveLength(1);
  });

  it("submits advanced values while collapsed and preserves edits across disclosure changes", async () => {
    const { container } = render(<SidebarHarness />);
    const form = container.querySelector("form");
    if (!form) throw new Error("Expected the sidebar to be inside a form");

    const text = getDictionary("en").sidebar;
    await userEvent.click(screen.getByRole("button", { name: text.openAssumptions }));
    const fee = screen.getByRole("textbox", { name: /Annual fee/ });
    await userEvent.clear(fee);
    await userEvent.type(fee, "0.12");
    await userEvent.click(screen.getByRole("button", { name: text.closeAssumptions }));

    const values = new FormData(form);
    expect(values.get("annual_fee_percent")).toBe("0.12");
    expect(values.get("expected_annual_inflation_percent")).toBe("2");
    expect(values.get("scenario_range_percentage_points")).toBe("2");
    expect(values.get("recurring_contribution.timing")).toBe("beginning");
    expect(values.get("recurring_contribution.annual_increase_percent")).toBe("2");
    const feeValue = form.elements.namedItem("annual_fee_percent");
    expect(feeValue).toBeTruthy();
    expect(values.get("annual_fee_percent")).toBe("0.12");
  });

  it("reveals and focuses invalid advanced assumptions through the projection form", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    const dictionary = getDictionary("en");
    render(<ProjectionScenarioView
      locale="en"
      languageLabel="Language"
      themeLabel="Toggle theme"
      targetText={getTargetText("en")}
      dictionary={dictionary}
      text={{
        sidebar: dictionary.sidebar,
        header: dictionary.header,
        chart: dictionary.chart,
        summary: dictionary.summary,
        composition: dictionary.composition,
        scenarios: dictionary.scenarios,
        unavailable: dictionary.unavailable,
        rateLimited: dictionary.rateLimited,
        invalidInputs: dictionary.invalidInputs,
        staleResults: dictionary.staleResults,
        retry: dictionary.retry,
        validation: dictionary.validation,
        resultsReady: dictionary.resultsReady,
        validationMessages: dictionary.validationMessages,
        sampleData: dictionary.sampleData,
        languageHandoffPending: dictionary.languageHandoffPending,
        languageHandoffStorage: dictionary.languageHandoffStorage,
      }}
    />);

    const sidebar = dictionary.sidebar;
    await userEvent.click(screen.getByRole("button", { name: sidebar.openAssumptions }));
    const range = screen.getByRole("textbox", { name: /Scenario range/ });
    await userEvent.clear(range);
    await userEvent.type(range, "10.1");
    await userEvent.click(screen.getByRole("button", { name: sidebar.closeAssumptions }));
    await userEvent.click(screen.getByRole("button", { name: dictionary.sidebar.calculate }));

    const visibleRange = await screen.findByRole("textbox", { name: /Scenario range/ });
    await waitFor(() => expect(document.activeElement).toBe(visibleRange));
    expect(visibleRange.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById("advanced-assumption-fields")?.hasAttribute("hidden")).toBe(false);
  });
});
