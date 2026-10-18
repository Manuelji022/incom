import type { Locale } from "@/lib/locales";

export function CalculatorModeToggle({ locale, mode, onModeChange, onBeforeSwitch }: {
  locale: Locale;
  mode: "projection" | "target";
  onModeChange: (mode: "projection" | "target") => void;
  onBeforeSwitch?: () => boolean;
}) {
  const labels = locale === "es"
    ? { group: "Modo de cálculo", projection: "Proyectar crecimiento", target: "Planificar objetivo" }
    : { group: "Calculation mode", projection: "Project growth", target: "Plan a target" };
  return <div role="group" aria-label={labels.group} className="border-b border-border-subtle bg-page px-4 py-3 sm:px-6">
    <div className="inline-flex max-w-full gap-1 rounded-lg border border-control-border bg-container p-1">
      {(["projection", "target"] as const).map((option) => <button
        key={option}
        type="button"
        aria-pressed={mode === option}
        onClick={() => {
          if (mode === option || (onBeforeSwitch && !onBeforeSwitch())) return;
          onModeChange(option);
        }}
        className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-center text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus ${mode === option ? "bg-brand-solid text-on-brand-solid-foreground" : "text-secondary-foreground hover:bg-component-hover"}`}
      >{option === "projection" ? labels.projection : labels.target}</button>)}
    </div>
  </div>;
}
