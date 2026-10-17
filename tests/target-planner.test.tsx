import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TargetPlanner } from "@/components/target-planner";
import { TargetResults } from "@/components/target-results";
import { CalculatorModeToggle } from "@/components/calculator-mode-toggle";
import { getDictionary } from "@/lib/i18n";
import { getTargetText } from "@/lib/target-i18n";
import { parseTargetResponse } from "@/lib/compound-interest-target";
import fixture from "./fixtures/target-response.json";

vi.mock("next/navigation", () => ({ usePathname: () => "/en/targets", useRouter: () => ({ push: vi.fn() }) }));
// Chart canvas depends on browser layout; schedule and all actual result markup remain real.
vi.mock("@/components/projection-chart", () => ({ ProjectionChart: () => <div data-testid="chart" /> }));
const text = getDictionary("en");
const targetText = getTargetText("en");
const props = { locale: "en" as const, text, targetText };
const mount = () => render(<TargetPlanner {...props} />);
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Calculate contributions" }));
const change = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
beforeEach(() => { sessionStorage.clear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("target planner", () => {
  it("offers a mode toggle with the active view and projection destination", () => {
    mount();
    const toggle = screen.getByRole("navigation", { name: "Calculation mode" });
    expect(within(toggle).getByRole("link", { name: "Plan a target" }).getAttribute("aria-current")).toBe("page");
    expect(within(toggle).getByRole("link", { name: "Project growth" }).getAttribute("href")).toBe("/en");
    cleanup();
    render(<CalculatorModeToggle locale="en" mode="projection" />);
    expect(screen.getByRole("link", { name: "Plan a target" }).getAttribute("href")).toBe("/en/targets");
  });
  it("submits exact decimals, shows loading, then scenario results and the annual schedule", async () => {
    let resolve!: (response: Response) => void;
    const mock = vi.fn().mockImplementation(() => new Promise<Response>((done) => { resolve = done; }));
    vi.stubGlobal("fetch", mock); mount();
    change(/Target amount/, "100000.001234567890123456"); change(/Investment horizon/, "2");
    submit();
    expect(screen.getByRole("button", { name: "Calculating…" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Calculating…");
    expect(JSON.parse(mock.mock.calls[0][1].body)).toEqual({ target_amount: "100000.001234567890123456", initial_principal: "0", duration_years: 2, expected_annual_return_percent: "7", contribution_plan: { frequency: "monthly" } });
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
    change(/Target basis/, "real"); submit();
    expect(mock).not.toHaveBeenCalled();
    const inflation = screen.getByLabelText(/Expected inflation/);
    expect(inflation.getAttribute("aria-invalid")).toBe("true");
    await waitFor(() => expect(document.activeElement).toBe(inflation));
    change(/Expected inflation/, "2.5000"); submit();
    await screen.findByText("Target results are ready.");
    const body = JSON.parse(mock.mock.calls[0][1].body);
    expect(body.target_basis).toBe("real"); expect(body.expected_annual_inflation_percent).toBe("2.5000");
    expect(screen.getByText(/105,062.50/)).toBeTruthy();
    expect(screen.getByText("Target in future nominal money")).toBeTruthy();
  });
  it("validates duration, contribution increase and derived scenario bounds before posting", async () => {
    const mock = vi.fn(); vi.stubGlobal("fetch", mock); mount();
    change(/Investment horizon/, "101"); change(/Expected annual return/, "50"); change(/Annual contribution increase/, "101");
    submit();
    expect(mock).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Investment horizon/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText(/Annual contribution increase/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByLabelText(/Scenario range/).getAttribute("aria-invalid")).toBe("true");
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
  it("saves form values and results when switching modes, and restores them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(fixture))); mount();
    change(/Target amount/, "123456.78900"); submit(); await screen.findByText("Target results are ready.");
    document.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(screen.getByRole("link", { name: "Project growth" }));
    expect(JSON.parse(sessionStorage.getItem("incom:target-session:v1")!).values.target_amount).toBe("123456.78900");
    cleanup(); mount();
    await waitFor(() => expect((screen.getByLabelText(/Target amount/) as HTMLInputElement).value).toBe("123456.78900"));
    expect(screen.getByRole("table")).toBeTruthy();
  });
  it("renders the target form in Spanish", () => {
    render(<TargetPlanner locale="es" text={getDictionary("es")} targetText={getTargetText("es")} />);
    expect(screen.getByRole("button", { name: "Calcular aportaciones" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Proyectar crecimiento" }).getAttribute("href")).toBe("/es");
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
