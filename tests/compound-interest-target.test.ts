// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTarget, parseTargetResponse, serializeTargetInput, targetInputFromForm, TargetApiError, validateTargetInput } from "@/features/compound-calculator/lib/compound-interest-target";
import { POST } from "@/app/api/compound-interest/targets/route";
import fixture from "./fixtures/target-response.json";
import type { TargetInput } from "@/features/compound-calculator/types/compound-interest-target";

const input: TargetInput = { target_amount: "100000.00", initial_principal: "0", duration_years: 2, expected_annual_return_percent: "7", contribution_plan: { frequency: "monthly" } };
const problem = (status: number) => ({ type: "about:blank", title: "Cannot calculate target", status, detail: "This target cannot be reached with these assumptions.", instance: "/api/v1/compound-interest/targets", code: "UNREACHABLE_TARGET", errors: [{ field: "target_amount", reason: "Try a longer horizon or a smaller target." }] });
const request = (body: unknown) => new Request("http://localhost/api/compound-interest/targets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
afterEach(() => vi.unstubAllGlobals());

describe("target input serialization and validation", () => {
  it("preserves decimal strings exactly and omits unused optional defaults", () => {
    const form = new FormData();
    Object.entries({ target_amount: "100000.123456789123456789", initial_principal: "0.00", duration_years: "20", expected_annual_return_percent: "7.0000", "contribution_plan.frequency": "quarterly", "contribution_plan.timing": "end", target_basis: "nominal", annual_fee_percent: "", expected_annual_inflation_percent: "", scenario_range_percentage_points: "", "contribution_plan.annual_increase_percent": "" }).forEach(([key, value]) => form.set(key, value));
    expect(targetInputFromForm(form)).toEqual({ target_amount: "100000.123456789123456789", initial_principal: "0.00", duration_years: 20, expected_annual_return_percent: "7.0000", contribution_plan: { frequency: "quarterly" } });
  });
  it("keeps explicit optional values and beginning timing", () => {
    const form = new FormData();
    Object.entries({ target_amount: "100", initial_principal: "0", duration_years: "1", expected_annual_return_percent: "0", "contribution_plan.frequency": "annual", "contribution_plan.timing": "beginning", "contribution_plan.annual_increase_percent": "-10.0000", target_basis: "real", expected_annual_inflation_percent: "0.0000", annual_fee_percent: "0.0800", scenario_range_percentage_points: "0" }).forEach(([key, value]) => form.set(key, value));
    expect(targetInputFromForm(form)).toEqual({ target_amount: "100", initial_principal: "0", duration_years: 1, expected_annual_return_percent: "0", contribution_plan: { frequency: "annual", timing: "beginning", annual_increase_percent: "-10.0000" }, target_basis: "real", expected_annual_inflation_percent: "0.0000", annual_fee_percent: "0.0800", scenario_range_percentage_points: "0" });
  });
  it("serializes only supported contract fields and omits absent optionals", () => {
    const polluted = { ...input, target_amount: "100000.00", contribution_plan: { ...input.contribution_plan, timing: undefined, annual_increase_percent: undefined }, ignored: "nope" } as TargetInput & { ignored: string };
    expect(serializeTargetInput(polluted)).toEqual(input);
  });
  it("requires explicit inflation for real targets, allowing zero", () => {
    expect(validateTargetInput(input)).toEqual([]);
    expect(validateTargetInput({ ...input, target_basis: "real" })).toEqual(expect.arrayContaining([expect.objectContaining({ field: "expected_annual_inflation_percent" })]));
    expect(validateTargetInput({ ...input, target_basis: "real", expected_annual_inflation_percent: "0" })).toEqual([]);
  });
  it.each([
    ["target_amount", "0"], ["target_amount", 100], ["target_amount", "1e6"], ["initial_principal", "-1"],
    ["duration_years", 0], ["duration_years", 101], ["duration_years", 1.5], ["duration_years", "20"],
    ["expected_annual_return_percent", "51"], ["expected_annual_return_percent", "7.00001"],
    ["annual_fee_percent", "101"], ["annual_fee_percent", null], ["expected_annual_inflation_percent", "-11"],
    ["scenario_range_percentage_points", "-1"], ["target_basis", null], ["unknown", "1"],
  ])("rejects invalid %s=%s", (field, value) => {
    expect(validateTargetInput({ ...input, [field]: value }).some((error) => error.field === field)).toBe(true);
  });
  it("validates contribution plans and derived scenario bounds", () => {
    expect(validateTargetInput({ ...input, contribution_plan: { frequency: "weekly", timing: null, annual_increase_percent: "101", amount: "100" } }).map((error) => error.field)).toEqual(expect.arrayContaining(["contribution_plan.frequency", "contribution_plan.timing", "contribution_plan.annual_increase_percent", "contribution_plan.amount"]));
    expect(validateTargetInput({ ...input, expected_annual_return_percent: "50" }).map((error) => error.field)).toContain("scenario_range_percentage_points");
    expect(validateTargetInput({ ...input, expected_annual_return_percent: "-50", scenario_range_percentage_points: "0", contribution_plan: { frequency: "annual", annual_increase_percent: "-10" } })).toEqual([]);
  });
});

describe("target response parsing", () => {
  it("retains every decimal string, annual point, disclosure and metadata field", () => expect(parseTargetResponse(fixture)).toEqual(fixture));
  it("accepts a zero starting contribution", () => {
    const body = structuredClone(fixture);
    body.scenarios[1].required_contribution_amount = "0.00";
    expect(parseTargetResponse(body).scenarios[1].required_contribution_amount).toBe("0.00");
  });
  it.each(["missing-point", "wrong-order", "numeric-money", "missing-inflation", "bad-summary"]) ("rejects malformed success: %s", (kind) => {
    const body = structuredClone(fixture); // Deliberately corrupt external JSON.
    if (kind === "missing-point") body.scenarios[0].annual_points.pop();
    if (kind === "wrong-order") body.scenarios.reverse();
    if (kind === "numeric-money") body.scenarios[0].required_contribution_amount = 12 as unknown as string;
    if (kind === "missing-inflation") Reflect.deleteProperty(body.resolved_inputs, "expected_annual_inflation_percent");
    if (kind === "bad-summary") body.scenarios[0].final_summary.nominal_balance = "garbage";
    expect(() => parseTargetResponse(body)).toThrow("invalid-response");
  });
  it.each(["wrong-model", "unknown-disclosure"]) ("rejects unsupported contract metadata: %s", (kind) => {
    const body = structuredClone(fixture);
    if (kind === "wrong-model") body.metadata.calculation_model_version = "old";
    else body.disclosures[0] = "SOMETHING_NEW";
    expect(() => parseTargetResponse(body)).toThrow("invalid-response");
  });
});

describe("client request and proxy", () => {
  it("posts the exact input to the same-origin endpoint", async () => {
    const mock = vi.fn().mockResolvedValue(Response.json(fixture)); vi.stubGlobal("fetch", mock);
    expect(await fetchTarget(input)).toEqual(fixture);
    expect(mock).toHaveBeenCalledWith("/api/compound-interest/targets", expect.objectContaining({ method: "POST", body: JSON.stringify(input), cache: "no-store" }));
  });
  it("never sends unknown fields or explicit undefined optionals", async () => {
    const mock = vi.fn().mockResolvedValue(Response.json(fixture)); vi.stubGlobal("fetch", mock);
    await fetchTarget({ ...input, unexpected: "ignored" } as TargetInput & { unexpected: string });
    expect(JSON.parse(mock.mock.calls[0][1].body)).toEqual(input);
  });
  it.each([400, 422, 500])("retains application/problem+json status %s and field errors", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(Response.json(problem(status), { status, headers: { "Content-Type": "application/problem+json" } }))));
    await expect(fetchTarget(input)).rejects.toMatchObject({ problem: problem(status) });
    await expect(fetchTarget(input)).rejects.toBeInstanceOf(TargetApiError);
  });
  it("proxies to financial-api without changing request or response decimals", async () => {
    const mock = vi.fn().mockResolvedValue(Response.json(fixture)); vi.stubGlobal("fetch", mock);
    const response = await POST(request(input));
    expect(response.status).toBe(200); expect(await response.json()).toEqual(fixture);
    expect(mock).toHaveBeenCalledWith("https://incom-api.manuelji.dev/api/v1/compound-interest/targets", expect.objectContaining({ body: JSON.stringify(input) }));
  });
  it.each([400, 422])("preserves backend status %s, problem code, detail and errors", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(problem(status), { status })));
    const response = await POST(request(input));
    expect(response.status).toBe(status); expect(response.headers.get("content-type")).toContain("application/problem+json"); expect(await response.json()).toEqual(problem(status));
  });
  it.each(["network", "server", "invalid-json", "invalid-shape"]) ("returns a generic 500 on %s failure", async (kind) => {
    const mock = vi.fn();
    if (kind === "network") mock.mockRejectedValue(new TypeError("private network detail"));
    else if (kind === "server") mock.mockResolvedValue(Response.json(problem(500), { status: 500 }));
    else if (kind === "invalid-json") mock.mockResolvedValue(new Response("bad json"));
    else mock.mockResolvedValue(Response.json({ scenarios: [] }));
    vi.stubGlobal("fetch", mock);
    const response = await POST(request(input)); const body = await response.json();
    expect(response.status).toBe(500); expect(body.detail).toContain("temporarily unavailable"); expect(body.detail).not.toContain("private");
  });
  it("rejects real targets missing inflation without calling upstream", async () => {
    const mock = vi.fn(); vi.stubGlobal("fetch", mock);
    const response = await POST(request({ ...input, target_basis: "real" }));
    expect(response.status).toBe(422); expect((await response.json()).errors[0].field).toBe("expected_annual_inflation_percent"); expect(mock).not.toHaveBeenCalled();
  });
  it("handles malformed request JSON as a 400 problem", async () => {
    const response = await POST(new Request("http://localhost/api/compound-interest/targets", { method: "POST", body: "{" }));
    expect(response.status).toBe(400); expect(response.headers.get("content-type")).toContain("application/problem+json");
  });
});
