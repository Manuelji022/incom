import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TargetPlanner } from "@/features/compound-calculator/components/target-planner";
import { TargetResults } from "@/features/compound-calculator/components/target-results";
import { CalculatorModeToggle } from "@/features/compound-calculator/components/calculator-mode-toggle";
import { ProjectionScenarioView } from "@/features/compound-calculator/components/projection-scenario-view";
import { getDictionary } from "@/lib/i18n";
import { getTargetText } from "@/features/compound-calculator/lib/target-i18n";
import { parseTargetResponse } from "@/features/compound-calculator/lib/compound-interest-target";
import fixture from "./fixtures/target-response.json";

vi.mock("@/features/compound-calculator/hooks/use-projection-controller", () => ({
  useProjectionController: () => ({
    projection: null, sample: false, pendingPromise: null, selectedName: "expected", setSelectedName: vi.fn(),
    currency: "EUR", setCurrency: vi.fn(), sidebarCollapsed: false, setSidebarCollapsed: vi.fn(),
    submitting: false, error: null, stale: false, setStale: vi.fn(), status: "", restoredValues: {}, formVersion: 0,
    saveBeforeLocaleChange: () => ({ status: "saved" }), submit: vi.fn(),
  }),
}));
vi.mock("@/components/header", () => ({ Header: ({ stale, staleText }: { stale: boolean; staleText: string }) => <div data-testid="header-stale">{stale ? staleText : ""}</div> }));

// Chart canvas depends on browser layout; schedule and all actual result markup remain real.
vi.mock("@/features/compound-calculator/components/projection-chart", () => ({ ProjectionChart: () => <div data-testid="chart" /> }));
const text = getDictionary("en");
const targetText = getTargetText("en");
const props = { locale: "en" as const, text, targetText };
const mount = () => render(<TargetPlanner {...props} />);
const mountParent = () => render(<ProjectionScenarioView
  locale="en" languageLabel="Language" themeLabel="Toggle theme" targetText={targetText} dictionary={text}
  text={{ sidebar: text.sidebar, header: text.header, chart: text.chart, summary: text.summary, composition: text.composition, scenarios: text.scenarios, unavailable: text.unavailable, rateLimited: text.rateLimited, invalidInputs: text.invalidInputs, staleResults: text.staleResults, retry: text.retry, validation: text.validation, resultsReady: text.resultsReady, validationMessages: text.validationMessages, sampleData: text.sampleData, languageHandoffPending: text.languageHandoffPending, languageHandoffStorage: text.languageHandoffStorage }}
/>);
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Calculate contributions" }));
const change = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
beforeEach(() => { sessionStorage.clear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("target planner", () => {
  it("switches both mounted calculator modes in place and reports target stale state", async () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    mountParent();
    expect((document.querySelector("main#main-content") as HTMLElement | null)?.hidden).toBe(false);
    const toggle = screen.getByRole("group", { name: "Calculation mode" });
    await userEvent.click(within(toggle).getByRole("button", { name: "Plan a target" }));
    const targetMain = screen.getByRole("heading", { level: 1, name: targetText.title }).closest("main");
    expect(targetMain?.hidden).toBe(false);
    expect(document.querySelectorAll("main#main-content")).toHaveLength(1);
    expect(document.querySelectorAll("#duration-years")).toHaveLength(1);
    expect(document.querySelectorAll("#target-duration-years")).toHaveLength(1);
    expect(document.querySelectorAll("#scenario-range")).toHaveLength(1);
    expect(document.querySelectorAll("#target-scenario-range")).toHaveLength(1);
    expect(document.querySelectorAll("#expected-annual-return")).toHaveLength(1);
    expect(document.querySelectorAll("#target-expected-annual-return")).toHaveLength(1);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(fixture)));
    change(/Target amount/, "120000");
    submit();
    await screen.findByText(targetText.ready);
    change(/Target amount/, "125000");
    expect(screen.getByTestId("header-stale").textContent).toBe(targetText.stale);
    await userEvent.click(within(toggle).getByRole("button", { name: "Project growth" }));
    expect((document.querySelector("main#main-content") as HTMLElement | null)?.hidden).toBe(false);
    await userEvent.click(within(toggle).getByRole("button", { name: "Plan a target" }));
    expect((screen.getByLabelText(/Target amount/) as HTMLInputElement).value).toBe("125,000");
    expect(sessionStorage.getItem("incom:calculator-mode:v1")).toBe("target");
    cleanup();
    mountParent();
    await waitFor(() => expect(within(screen.getByRole("group", { name: "Calculation mode" })).getByRole("button", { name: "Plan a target" }).getAttribute("aria-pressed")).toBe("true"));
    expect((screen.getByLabelText(/Target amount/) as HTMLInputElement).value).toBe("125,000");
  });
  it("offers an accessible in-page mode toggle", async () => {
    const onModeChange = vi.fn();
    render(<CalculatorModeToggle locale="en" mode="projection" onModeChange={onModeChange} />);
    const toggle = screen.getByRole("group", { name: "Calculation mode" });
    expect(within(toggle).getByRole("button", { name: "Project growth" }).getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(within(toggle).getByRole("button", { name: "Plan a target" }));
    expect(onModeChange).toHaveBeenCalledWith("target");
  });
  it("submits exact decimals, shows loading, then scenario results and the annual schedule", async () => {
    let resolve!: (response: Response) => void;
    const mock = vi.fn().mockImplementation(() => new Promise<Response>((done) => { resolve = done; }));
    vi.stubGlobal("fetch", mock); mount();
    change(/Target amount/, "100000.001234567890123456"); fireEvent.change(screen.getByRole("textbox", { name: /Investment horizon/ }), { target: { value: "2" } });
    submit();
    expect(screen.getByRole("button", { name: "Calculating…" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Calculating…");
    expect(JSON.parse(mock.mock.calls[0][1].body)).toEqual({ target_amount: "100000.001234567890123456", initial_principal: "10000", duration_years: 2, expected_annual_return_percent: "7", contribution_plan: { frequency: "monthly", annual_increase_percent: "0" }, annual_fee_percent: "0.08", expected_annual_inflation_percent: "2.5", scenario_range_percentage_points: "2" });
    await act(async () => resolve(Response.json(fixture)));
    expect(await screen.findByText("Target results are ready.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Expected · 7%.*3,902.11.*per month/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Annual contribution schedule · Expected")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(4); // Header, year 0, year 1, year 2.
    expect(screen.getByRole("rowheader", { name: "0" })).toBeTruthy();
    expect(screen.getByRole("rowheader", { name: "2" })).toBeTruthy();
    expect(screen.getByText("Illustrative projections, not guaranteed results.")).toBeTruthy();
    expect(screen.getByText("Taxes are excluded.")).toBeTruthy();
    expect(screen.getAllByText("Balance in today's money").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: /Cautious · 5%/ }));
    expect(screen.getByText("Annual contribution schedule · Cautious")).toBeTruthy();
    const table = screen.getByRole("table");
    expect(within(table).getAllByText(/47,697.12/)).toHaveLength(3);
    expect(screen.getAllByText(/server default/, { selector: "dd" })[0]).toBeTruthy();
    change(/Target amount/, "120000");
    expect(screen.getAllByText(targetText.stale).length).toBeGreaterThan(0);
  });
  it("requires inflation for real targets and displays the backend nominal target", async () => {
    const real = structuredClone(fixture);
    real.resolved_inputs.target_basis = "real";
    real.resolved_inputs.nominal_target_amount = "105062.50";
    real.resolved_inputs.expected_annual_inflation_percent = { value: "2.5", source: "caller" };
    const mock = vi.fn().mockResolvedValue(Response.json(real)); vi.stubGlobal("fetch", mock); mount();
    const nominalInflation = screen.getByRole("textbox", { name: /Expected inflation/ });
    expect(nominalInflation.hasAttribute("required")).toBe(false);
    expect(nominalInflation.getAttribute("aria-required")).toBe("false");
    change(/Expected inflation/, ""); change(/Target basis/, "real"); submit();
    expect(mock).not.toHaveBeenCalled();
    const inflation = screen.getByRole("textbox", { name: /Expected inflation/ });
    expect(inflation.hasAttribute("required")).toBe(true);
    expect(inflation.getAttribute("aria-required")).toBe("true");
    expect(inflation.getAttribute("aria-invalid")).toBe("true");
    await waitFor(() => expect(document.activeElement).toBe(inflation));
    fireEvent.change(inflation, { target: { value: "2.5000" } }); submit();
    await screen.findByText("Target results are ready.");
    const body = JSON.parse(mock.mock.calls[0][1].body);
    expect(body.target_basis).toBe("real"); expect(body.expected_annual_inflation_percent).toBe("2.5000");
    expect(screen.getByText(/105,062.50/)).toBeTruthy();
    expect(screen.getByText("Target in future nominal money")).toBeTruthy();
  });
  it("validates duration, contribution increase and derived scenario bounds before posting", async () => {
    const mock = vi.fn(); vi.stubGlobal("fetch", mock); mount();
    fireEvent.change(screen.getByRole("textbox", { name: /Investment horizon/ }), { target: { value: "101" } }); fireEvent.change(screen.getByRole("textbox", { name: /Expected annual return/ }), { target: { value: "50" } }); change(/Annual contribution increase/, "101");
    submit();
    expect(mock).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: /Investment horizon/ }).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText(/Annual contribution increase/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("textbox", { name: /Scenario range/ }).getAttribute("aria-invalid")).toBe("true");
  });
  it.each([400, 422])("displays status %s problem details, field errors, and allows retry", async (status) => {
    const mock = vi.fn().mockResolvedValueOnce(Response.json({ type: "about:blank", title: "Invalid inputs", status, detail: "The target cannot be reached. Try a longer horizon.", instance: "/api/v1/compound-interest/targets", code: "UNREACHABLE_TARGET", errors: [{ field: "target_amount", reason: "Reduce the target." }] }, { status, headers: { "Content-Type": "application/problem+json" } })).mockResolvedValueOnce(Response.json(fixture));
    vi.stubGlobal("fetch", mock); mount(); submit();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("The target cannot be reached. Try a longer horizon.")).toBeTruthy();
    expect(screen.getByLabelText(/Target amount/).getAttribute("aria-invalid")).toBe("true");
    change(/Target amount/, "50000"); submit();
    await screen.findByText("Target results are ready.");
    expect(mock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("shows API field errors beside reused assumption controls", async () => {
    const mock = vi.fn().mockResolvedValue(Response.json({ type: "about:blank", title: "Invalid inputs", status: 422, detail: "Review the highlighted assumptions.", instance: "/api/v1/compound-interest/targets", code: "VALIDATION_ERROR", errors: [
      { field: "duration_years", reason: "Choose a supported duration." },
      { field: "expected_annual_return_percent", reason: "Choose a supported return." },
      { field: "expected_annual_inflation_percent", reason: "Enter inflation." },
      { field: "annual_fee_percent", reason: "Choose a supported fee." },
      { field: "scenario_range_percentage_points", reason: "Choose a supported range." },
    ] }, { status: 422, headers: { "Content-Type": "application/problem+json" } }));
    vi.stubGlobal("fetch", mock); mount(); submit();
    expect(await screen.findByRole("alert")).toBeTruthy();
    for (const label of [/Investment horizon/, /Expected annual return/, /Expected inflation/, /Annual fee/, /Scenario range/]) {
      expect(screen.getByRole("textbox", { name: label }).getAttribute("aria-invalid")).toBe("true");
    }
    expect(screen.getByText("Choose a supported duration.")).toBeTruthy();
    expect(screen.getByText("Enter inflation.")).toBeTruthy();
    fireEvent.change(screen.getByRole("slider", { name: /Investment horizon/ }), { target: { value: "22" } });
    expect(screen.queryByText("Choose a supported duration.")).toBeNull();
    fireEvent.change(screen.getByRole("slider", { name: "Scenario range" }), { target: { value: "3" } });
    expect(screen.queryByText("Choose a supported range.")).toBeNull();
  });
  it.each(["500", "network", "malformed"]) ("uses a friendly generic error for %s", async (kind) => {
    const mock = vi.fn();
    if (kind === "network") mock.mockRejectedValue(new TypeError("Network down"));
    else if (kind === "malformed") mock.mockResolvedValue(new Response("not json"));
    else mock.mockResolvedValue(Response.json({ title: "Failure", detail: "private stack trace", code: "INTERNAL", errors: [] }, { status: 500 }));
    vi.stubGlobal("fetch", mock); mount(); submit();
    expect((await screen.findByRole("alert")).textContent).toContain(targetText.failed);
    expect(screen.queryByText(/private stack trace/)).toBeNull();
    expect(screen.getByRole("button", { name: "Calculate contributions" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
  it("saves target inputs and results for a mode or language change", async () => {
    const saveRef = { current: () => false };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(fixture)));
    render(<TargetPlanner {...props} saveRef={saveRef} />);
    change(/Target amount/, "123456.78900"); submit(); await screen.findByText("Target results are ready.");
    expect(saveRef.current()).toBe(true);
    expect(JSON.parse(sessionStorage.getItem("incom:target-session:v2")!).values.target_amount).toBe("123456.78900");
    cleanup(); mount();
    await waitFor(() => expect((screen.getByLabelText(/Target amount/) as HTMLInputElement).value).toBe("123,456.78900"));
    expect(screen.getByRole("table")).toBeTruthy();
  });
  it("renders the target form in Spanish", () => {
    render(<TargetPlanner locale="es" text={getDictionary("es")} targetText={getTargetText("es")} />);
    expect(screen.getByRole("button", { name: "Calcular aportaciones" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Planificar un objetivo" })).toBeTruthy();
  });
});

describe("target result edge cases", () => {
  it("labels quarterly contributions per quarter, including zero", () => {
    const result = parseTargetResponse(structuredClone(fixture));
    result.resolved_inputs.contribution_plan.frequency = "quarterly";
    result.scenarios[1].required_contribution_amount = "0.00";
    render(<TargetResults {...props} result={result} currency="EUR" />);
    expect(screen.getAllByText("per quarter")).toHaveLength(3);
    expect(screen.getByText(targetText.zero)).toBeTruthy();
  });
  it("labels annual contributions per year", () => {
    const result = parseTargetResponse(structuredClone(fixture));
    result.resolved_inputs.contribution_plan.frequency = "annual";
    render(<TargetResults {...props} result={result} currency="EUR" />);
    expect(screen.getAllByText("per year")).toHaveLength(3);
  });
});
