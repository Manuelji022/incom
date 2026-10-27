import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioTracker } from "@/features/portfolio-rebalancing/components/portfolio-tracker";
import { getDictionary } from "@/lib/i18n";
import { PORTFOLIO_STORAGE_KEY } from "@/features/portfolio-rebalancing/lib/portfolio";

vi.mock("@/components/header", () => ({ Header: () => <header>INCOM</header> }));
vi.mock("@/components/footer", () => ({ Footer: () => <footer>Footer</footer> }));

const renderTracker = () => render(<PortfolioTracker locale="en" copy={getDictionary("en").portfolio} languageLabel="Language" themeLabel="Theme" />);

async function addFund(user: ReturnType<typeof userEvent.setup>, { code = "OWN-FUND", name = "My Fund", target = "100" } = {}) {
  await user.click(screen.getByRole("button", { name: "Add fund" }));
  await user.type(screen.getByRole("textbox", { name: "Fund code" }), code);
  await user.type(screen.getByRole("textbox", { name: "Fund name" }), name);
  await user.type(screen.getByRole("textbox", { name: "Invested (€)" }), "100");
  await user.type(screen.getByRole("textbox", { name: "Current (€)" }), "120");
  await user.type(screen.getByRole("textbox", { name: "Target (%)" }), target);
  await user.click(screen.getAllByRole("button", { name: "Add fund" }).at(-1)!);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  vi.stubGlobal("confirm", vi.fn(() => true));
});

describe("portfolio tracker interactions", () => {
  it("shows three sample funds, replaces them on the first add, sorts, edits and deletes", async () => {
    const user = userEvent.setup();
    renderTracker();
    expect(await screen.findByText(/adding your first fund replaces these three examples/i)).toBeTruthy();
    expect(screen.getByRole("row", { name: /MOCK-GLOBAL/ })).toBeTruthy();
    expect(screen.getByRole("row", { name: /MOCK-BONDS/ })).toBeTruthy();
    expect(screen.getByRole("row", { name: /MOCK-EM/ })).toBeTruthy();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) ?? "{}")).toMatchObject({ version: 2, mode: "sample", funds: expect.arrayContaining([expect.objectContaining({ code: "MOCK-GLOBAL" }), expect.objectContaining({ code: "MOCK-BONDS" }), expect.objectContaining({ code: "MOCK-EM" })]) }));
    await addFund(user, { code: "ALPHA", name: "Alpha Fund" });
    expect((await screen.findByRole("textbox", { name: "Code, ALPHA" }) as HTMLInputElement).value).toBe("ALPHA");
    expect(screen.queryByRole("row", { name: /MOCK-GLOBAL/ })).toBeNull();
    expect(screen.getAllByText("+20.00%")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Add fund" }));
    await user.type(screen.getByRole("textbox", { name: "Fund code" }), "BETA");
    await user.type(screen.getByRole("textbox", { name: "Fund name" }), "Beta Fund");
    await user.type(screen.getByRole("textbox", { name: "Invested (€)" }), "0");
    await user.type(screen.getByRole("textbox", { name: "Current (€)" }), "0");
    await user.type(screen.getByRole("textbox", { name: "Target (%)" }), "0");
    await user.click(screen.getAllByRole("button", { name: "Add fund" }).at(-1)!);
    const currentValueSort = screen.getByRole("button", { name: /Current value/ });
    await user.click(currentValueSort);
    expect(screen.getAllByRole("textbox", { name: /^Code,/ }).map((input) => (input as HTMLInputElement).value)[0]).toBe("ALPHA");
    await user.click(currentValueSort);
    expect(screen.getAllByRole("textbox", { name: /^Code,/ }).map((input) => (input as HTMLInputElement).value)[0]).toBe("BETA");
    expect(screen.getByRole("row", { name: /Alpha Fund/ })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Delete ALPHA" }));
    expect(screen.queryByRole("textbox", { name: "Code, ALPHA" })).toBeNull();
    expect(screen.getByRole("button", { name: "Undo delete" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Undo delete" }));
    expect(screen.getByRole("textbox", { name: "Code, ALPHA" })).toBeTruthy();
  });

  it("loads committed values on mount and persists edits without resetting stored data", async () => {
    const user = userEvent.setup();
    renderTracker();
    await screen.findByRole("row", { name: /MOCK-GLOBAL/ });
    await addFund(user);
    await waitFor(() => expect(JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) ?? "{}")).toMatchObject({ mode: "custom", funds: [{ code: "OWN-FUND" }] }));
    const first = screen.getByRole("textbox", { name: "Target weight (%), OWN-FUND" });
    await user.clear(first);
    await user.type(first, "60.00");
    await user.tab();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) ?? "{}").funds[0].targetBps).toBe(6000));
    const invested = screen.getByRole("textbox", { name: "Invested capital, OWN-FUND" });
    await user.clear(invested);
    await user.type(invested, "8500.00");
    await user.tab();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) ?? "{}").funds[0].investedCents).toBe(850_000));
    cleanup();
    renderTracker();
    expect((await screen.findByRole("textbox", { name: "Target weight (%), OWN-FUND" }) as HTMLInputElement).value).toBe("60.00");
    expect((await screen.findByRole("textbox", { name: "Invested capital, OWN-FUND" }) as HTMLInputElement).value).toBe("8500.00");
    expect(document.querySelector("p[aria-live='polite']")?.textContent).toContain("40.00 pp below");
  });

  it("retains invalid draft text and announces validation without committing it", async () => {
    const user = userEvent.setup();
    renderTracker();
    await screen.findByRole("row", { name: /MOCK-GLOBAL/ });
    await addFund(user);
    const input = screen.getByRole("textbox", { name: "Invested capital, OWN-FUND" });
    await user.clear(input);
    await user.type(input, "12.345");
    await user.tab();
    expect(await screen.findByText(/up to two decimal places/)).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("12.345");
    expect(JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) ?? "{}").funds[0].investedCents).toBe(10_000);
    await user.click(input);
    await user.keyboard("{Escape}");
    expect((input as HTMLInputElement).value).toBe("100.00");
  });

  it("ignores malformed storage instead of crashing", async () => {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, "{bad json");
    renderTracker();
    expect(await screen.findByText(/adding your first fund replaces these three examples/i)).toBeTruthy();
    expect(screen.getAllByRole("row", { name: /MOCK-/ })).toHaveLength(3);
  });
});
