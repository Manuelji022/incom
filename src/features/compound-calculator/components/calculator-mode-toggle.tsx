import Link from "next/link";
import type { Locale } from "@/lib/locales";

export function CalculatorModeToggle({ locale, mode, onBeforeSwitch }: {
  locale: Locale;
  mode: "projection" | "target";
  onBeforeSwitch?: () => boolean;
}) {
  return <nav aria-label={locale === "es" ? "Modo de cálculo" : "Calculation mode"} className="border-b border-border-subtle bg-page px-4 py-3 sm:px-6">
    <div className="inline-flex max-w-full gap-1 rounded-lg border border-control-border bg-container p-1">
      {(["projection", "target"] as const).map((option) => <Link
        key={option}
        href={`/${locale}${option === "target" ? "/targets" : ""}`}
        aria-current={mode === option ? "page" : undefined}
        onClick={(event) => { if (mode !== option && onBeforeSwitch && !onBeforeSwitch()) event.preventDefault(); }}
        className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-center text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus ${mode === option ? "bg-brand-solid text-on-brand-solid-foreground" : "text-secondary-foreground hover:bg-component-hover"}`}
      >{option === "projection" ? (locale === "es" ? "Proyectar crecimiento" : "Project growth") : (locale === "es" ? "Planificar objetivo" : "Plan a target")}</Link>)}
    </div>
  </nav>;
}
