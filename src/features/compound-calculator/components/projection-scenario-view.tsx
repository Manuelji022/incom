"use client";

import { Suspense, use, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type SyntheticEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatedAlert } from "@/components/animated-alert";
import { Header } from "@/components/header";
import { ProjectionResults } from "@/features/compound-calculator/components/projection-results";
import { CompoundInputSidebar } from "@/features/compound-calculator/components/compound-input-sidebar";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import { clearFieldValidation, showFieldValidation } from "@/features/compound-calculator/lib/field-validation";
import { useProjectionController } from "@/features/compound-calculator/hooks/use-projection-controller";
import { TargetPlanner } from "@/features/compound-calculator/components/target-planner";
import type { getTargetText } from "@/features/compound-calculator/lib/target-i18n";
import { calculatorModeSessionKey } from "@/features/compound-calculator/lib/calculator-mode";

type Dictionary = ReturnType<typeof getDictionary>;
type CompositionDictionary = Dictionary["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };
type ProjectionScenarioViewProps = {
  locale: Locale;
  targetText: ReturnType<typeof getTargetText>;
  dictionary: Dictionary;
  languageLabel: string;
  themeLabel: string;
  text: Pick<Dictionary, "header" | "chart" | "summary" | "scenarios" | "sidebar" | "unavailable" | "rateLimited" | "invalidInputs" | "staleResults" | "retry" | "validation" | "resultsReady" | "validationMessages" | "sampleData" | "languageHandoffPending" | "languageHandoffStorage"> & {
    composition: CompositionText;
  };
};

// One responsive presentation, sharing all calculation and form state.
const desktopQuery = "(min-width: 64rem)";
function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function getDesktopSnapshot() {
  return window.matchMedia(desktopQuery).matches;
}
function getServerDesktopSnapshot() {
  return true;
}

// Keep URL-driven navigation in a small Suspense boundary so the calculator can
// still be prerendered. Explicit menu links take priority over the saved mode.
function CalculatorRouteMode({ mode, onModeChange }: { mode: "projection" | "target"; onModeChange: (mode: "projection" | "target") => void }) {
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");
  useEffect(() => {
    let nextMode: "projection" | "target" = "projection";
    try {
      if (requestedMode === "projection" || requestedMode === "target") {
        nextMode = requestedMode;
        sessionStorage.setItem(calculatorModeSessionKey, nextMode);
      } else if (sessionStorage.getItem(calculatorModeSessionKey) === "target") {
        nextMode = "target";
      }
    } catch { /* URL navigation still works when storage is unavailable. */ }
    onModeChange(nextMode);
  }, [requestedMode, onModeChange]);
  useEffect(() => {
    // Focus only after the requested view has committed; focusing the previous
    // main before it becomes hidden would leave focus on the document body.
    if (mode === requestedMode) document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [mode, requestedMode]);
  return null;
}

function RequestGate({ promise }: { promise: Promise<void> | null }) {
  if (promise) use(promise);
  return null;
}

function ProjectionSkeleton() {
  return <div aria-hidden="true" className="motion-safe:animate-pulse">
    <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
      {[0, 1].map((item) => <div key={item} className="h-24 rounded-md bg-container" />)}
    </div>
    <div className="px-5 py-4"><div className="h-[330px] rounded-md bg-container" /></div>
    <div className="space-y-3 px-5 pb-6 pt-4">
      <div className="h-6 w-1/3 rounded bg-container" />
      {[0, 1, 2, 3].map((item) => <div key={item} className="h-12 rounded-md bg-container" />)}
    </div>
  </div>;
}

export function ProjectionScenarioView({ locale, languageLabel, themeLabel, text, targetText, dictionary }: ProjectionScenarioViewProps) {
  const controller = useProjectionController(locale, text.validationMessages, {
    calculating: text.sidebar.calculating,
    validation: text.validation,
    ready: text.resultsReady,
    invalid: text.invalidInputs,
    unavailable: text.unavailable,
    rateLimited: text.rateLimited,
  });
  const { projection, sample, pendingPromise, selectedName, setSelectedName, currency, setCurrency, sidebarCollapsed, setSidebarCollapsed, submitting, error, stale, setStale, status, restoredValues, formVersion } = controller;
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getServerDesktopSnapshot);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mode, setMode] = useState<"projection" | "target">("projection");
  const [targetStatus, setTargetStatus] = useState({ stale: false, submitting: false });
  const formRef = useRef<HTMLFormElement>(null);
  const targetSaveRef = useRef<() => boolean>(() => true);
  const resultsRef = useRef<HTMLElement>(null);
  const revealResults = useRef(false);
  const selectedScenario = projection?.scenarios.find((scenario) => scenario.name === selectedName);

  useEffect(() => {
    if (submitting || pendingPromise || !revealResults.current) return;
    revealResults.current = false;
    if (!window.matchMedia(desktopQuery).matches) {
      // Scroll after the collapsed form and resolved Suspense content commit.
      resultsRef.current?.focus({ preventScroll: true });
      resultsRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [submitting, pendingPromise]);

  const clearValidation = (event: SyntheticEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (submitting) return;
    clearFieldValidation(target);
    if (target instanceof HTMLInputElement && target.type === "number") {
      showFieldValidation(target, locale);
    }
  };

  const saveBeforeLocaleChange = (destination: Locale) => controller.saveBeforeLocaleChange(destination, formRef.current);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    void controller.submit(form, (invalid) => {
      for (const field of invalid) {
        showFieldValidation(field, locale);
      }
      const firstInvalid = invalid[0];
      if (firstInvalid?.closest("#advanced-assumption-fields")) setAdvancedOpen(true);
      if (sidebarCollapsed) setSidebarCollapsed(false);
      window.requestAnimationFrame(() => firstInvalid?.focus());
    }, () => { revealResults.current = true; });
  };

  return (
    <>
    <Suspense fallback={null}><CalculatorRouteMode mode={mode} onModeChange={setMode} /></Suspense>
    <Header locale={locale} languageLabel={languageLabel} themeLabel={themeLabel} stale={mode === "target" ? targetStatus.stale : stale} staleText={mode === "target" ? targetText.stale : text.staleResults} onBeforeLanguageChange={(destination) => {
      if (submitting || targetStatus.submitting) return { status: "pending" };
      const projectionSave = saveBeforeLocaleChange(destination);
      if (projectionSave.status !== "saved") return projectionSave;
      return targetSaveRef.current() ? { status: "saved" } : { status: "storage" };
    }} submitting={mode === "target" ? targetStatus.submitting : submitting} languageHandoffText={{ pending: text.languageHandoffPending, storage: text.languageHandoffStorage }} />
    <TargetPlanner locale={locale} text={dictionary} targetText={targetText} saveRef={targetSaveRef} onStatusChange={setTargetStatus} active={mode === "target"} />
    <main id={mode === "projection" ? "main-content" : undefined} hidden={mode !== "projection"} tabIndex={-1} className={`grid flex-1 grid-cols-1 lg:min-h-[65.125rem] ${sidebarCollapsed ? "lg:grid-cols-[2.5rem_minmax(0,1fr)]" : "lg:grid-cols-[18.25rem_minmax(0,1fr)]"}`}>
    <form key={formVersion} ref={formRef} noValidate onSubmit={handleSubmit} onInput={(event) => {
      const target = event.target;
      clearValidation(event);
      if (target instanceof HTMLSelectElement && target.id === "display-currency") return;
      if (projection) setStale(true);
    }} className="contents">
      <CompoundInputSidebar advancedOpen={advancedOpen} onToggleAdvanced={() => setAdvancedOpen((value) => !value)} text={text.sidebar} locale={locale} submitting={submitting} calculatingLabel={text.sidebar.calculating} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((value) => !value)} currency={currency} onCurrencyChange={setCurrency} initialValues={restoredValues} />
      <section ref={resultsRef} tabIndex={-1} aria-label={text.header.portfolio} className={`min-w-0 bg-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${sidebarCollapsed ? "lg:border-s lg:border-border-subtle" : ""}`}>
        <p aria-live="polite" aria-atomic="true" className="sr-only">{status}</p>
        {sample ? <p role="status" className="mx-4 mt-3 flex items-start gap-2 rounded-md border border-brand-border-subtle bg-brand-subtle px-3 py-2.5 text-sm leading-5 text-on-brand-subtle-foreground">
          <span aria-hidden="true" className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-current text-[0.625rem] font-bold leading-none">i</span>
          <span>{text.sampleData}</span>
        </p> : null}
        <AnimatedAlert visible={error} className="mx-4 mt-3 rounded-md border border-border-subtle px-3 py-2 text-sm">
          {status} <button type="submit" className="ms-2 underline">{text.retry}</button>
        </AnimatedAlert>
        <Suspense fallback={<ProjectionSkeleton />}>
          <RequestGate promise={pendingPromise} />
          {selectedScenario ? <ProjectionResults
            isDesktop={isDesktop}
            scenarios={projection.scenarios}
            selectedName={selectedName}
            onSelectScenario={setSelectedName}
            compositionText={text.composition}
            scenarioText={text.scenarios}
            selectedScenario={selectedScenario}
            durationYears={projection.resolved_inputs.duration_years}
            locale={locale}
            currency={currency}
            text={{ header: text.header, chart: text.chart, summary: text.summary, scenarioLabel: text.scenarios[selectedName] }}
          /> : null}
        </Suspense>
      </section>
    </form>
    </main>
    </>
  );
}
