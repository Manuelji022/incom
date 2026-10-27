import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { Header } from "@/components/header";

vi.mock("@/components/language-switcher", () => ({ LanguageSwitcher: () => <button>Language</button> }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => <button>Theme</button> }));
vi.mock("next/link", () => ({
  default: ({ onNavigate, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { onNavigate?: () => void }) => (
    <a {...props} onClick={(event) => { event.preventDefault(); onNavigate?.(); }} />
  ),
}));

const props = {
  locale: "en" as const,
  languageLabel: "Language",
  themeLabel: "Theme",
  stale: false,
  staleText: "Inputs changed",
  onBeforeLanguageChange: () => ({ status: "saved" as const }),
  submitting: false,
  languageHandoffText: { pending: "Wait", storage: "Try again" },
};

// jsdom has no native dialog implementation. Exercise component behavior here;
// native focus containment, Escape, and backdrop dismissal are browser checks.
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  } });
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  vi.restoreAllMocks();
});

describe("header navigation", () => {
  it("opens two navigation cards with locale-aware links and locks background scrolling", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "auto";
    render(<Header {...props} />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    const calculators = within(dialog).getByRole("region", { name: "Calculators" });
    expect(within(calculators).getAllByRole("link")).toHaveLength(2);
    expect(within(calculators).getByRole("link", { name: /Projection/ }).getAttribute("href")).toBe("/en?mode=target");
    expect(within(calculators).getByRole("link", { name: /Compound interest/ }).getAttribute("href")).toBe("/en?mode=projection");
    const portfolio = within(dialog).getByRole("region", { name: "Portfolio" });
    expect(within(portfolio).getAllByRole("link")).toHaveLength(1);
    expect(within(portfolio).getByRole("link", { name: /Portfolio balancing/ }).getAttribute("href")).toBe("/en/portfolio");
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });

  it("closes after navigation and restores scroll on unmount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Header {...props} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("link", { name: /Compound interest/ }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps expanded state in sync with native dialog dismissal", async () => {
    const user = userEvent.setup();
    render(<Header {...props} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent(screen.getByRole("dialog"), new Event("close"));
    expect(screen.getByRole("button", { name: "Open menu" }).getAttribute("aria-expanded")).toBe("false");
    expect(document.body.style.overflow).toBe("");
  });

  it("translates the menu and keeps Spanish destinations", async () => {
    const user = userEvent.setup();
    render(<Header {...props} locale="es" />);
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Proyección/ }).getAttribute("href")).toBe("/es?mode=target");
    expect(screen.getByRole("link", { name: /Interés compuesto/ }).getAttribute("href")).toBe("/es?mode=projection");
    expect(screen.getByRole("link", { name: /Equilibrio de cartera/ }).getAttribute("href")).toBe("/es/portfolio");
  });
});
