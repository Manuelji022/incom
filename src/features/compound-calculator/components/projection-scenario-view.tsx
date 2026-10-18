"use client";

import { Suspense, use, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type SyntheticEvent } from "react";
import { Header } from "@/components/header";
import { InsightsSidebar } from "@/features/compound-calculator/components/insights-sidebar";
import { ProjectionResults } from "@/features/compound-calculator/components/projection-results";
import { CompoundInputSidebar } from "@/features/compound-calculator/components/compound-input-sidebar";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import { clearFieldValidation, showFieldValidation } from "@/features/compound-calculator/lib/field-validation";
import { useProjectionController } from "@/features/compound-calculator/hooks/use-projection-controller";
import { CalculatorModeToggle } from "@/features/compound-calculator/components/calculator-mode-toggle";
import { TargetPlanner } from "@/features/compound-calculator/components/target-planner";
import type { getTargetText } from "@/features/compound-calculator/lib/target-i18n";

type Dictionary = ReturnType<typeof getDictionary>;
type CompositionDictionary = Dictionary["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };
type ProjectionScenarioViewProps = {
  locale: Locale;
  targetText: ReturnType<typeof getTargetText>;
  dictionary: Dictionary;
  languageLabel: string;
  themeLabel: string;
  text: Pick<Dictionary, "header" | "chart" | "summary" | "scenarios" | "sidebar" | "unavailable" | "invalidInputs" | "staleResults" | "retry" | "validation" | "resultsReady" | "validationMessages" | "sampleData" | "languageHandoffPending" | "languageHandoffStorage"> & {
    composition: CompositionText;
  };
};

// One responsive presentation, sharing all calculation and form state.
const desktopQuery = "(min-width: 64rem)";
const modeSessionKey = "incom:calculator-mode:v1";
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

function InsightsSkeleton() {
  return <aside aria-hidden="true" className="[container-type:inline-size] border-t border-border-subtle bg-container motion-safe:animate-pulse lg:min-h-full lg:border-t-0 lg:border-s">
    <div className="space-y-4 p-5">
      <div className="h-6 w-2/3 rounded bg-page" />
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((item) => <div key={item} className="h-24 rounded-md bg-page" />)}</div>
    </div>
    <div className="space-y-4 border-t border-border-subtle p-5">
      <div className="h-6 w-1/2 rounded bg-page" />
      <div className="h-44 rounded-md bg-page" />
    </div>
  </aside>;
}

export function ProjectionScenarioView({ locale, languageLabel, themeLabel, text, targetText, dictionary }: ProjectionScenarioViewProps) {
  const controller = useProjectionController(locale, text.validationMessages, {
    calculating: text.sidebar.calculating,
    validation: text.validation,
    ready: text.resultsReady,
    invalid: text.invalidInputs,
    unavailable: text.unavailable,
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
    queueMicrotask(() => {
      try {
        if (sessionStorage.getItem(modeSessionKey) === "target") setMode("target");
      } catch { /* Storage can be unavailable; projection remains the safe default. */ }
    });
  }, []);

  const changeMode = (nextMode: "projection" | "target") => {
    try { sessionStorage.setItem(modeSessionKey, nextMode); } catch { /* The current view still changes without storage. */ }
    setMode(nextMode);
  };

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
    <Header locale={locale} languageLabel={languageLabel} themeLabel={themeLabel} stale={mode === "target" ? targetStatus.stale : stale} staleText={mode === "target" ? targetText.stale : text.staleResults} onBeforeLanguageChange={(destination) => {
      if (submitting || targetStatus.submitting) return { status: "pending" };
      const projectionSave = saveBeforeLocaleChange(destination);
      if (projectionSave.status !== "saved") return projectionSave;
      return targetSaveRef.current() ? { status: "saved" } : { status: "storage" };
    }} submitting={mode === "target" ? targetStatus.submitting : submitting} languageHandoffText={{ pending: text.languageHandoffPending, storage: text.languageHandoffStorage }} />
    <CalculatorModeToggle locale={locale} mode={mode} onModeChange={changeMode} onBeforeSwitch={() => {
      if (mode === "target") {
        if (targetStatus.submitting) return false;
        targetSaveRef.current();
      } else {
        if (submitting) return false;
        controller.saveBeforeLocaleChange(locale, formRef.current);
      }
      return true;
    }} />
    <TargetPlanner locale={locale} text={dictionary} targetText={targetText} saveRef={targetSaveRef} onStatusChange={setTargetStatus} active={mode === "target"} />
    <main id={mode === "projection" ? "main-content" : undefined} hidden={mode !== "projection"} tabIndex={-1} className={`grid flex-1 grid-cols-1 lg:min-h-[65.125rem] ${sidebarCollapsed ? "lg:grid-cols-[2.5rem_minmax(0,1fr)_19.5rem]" : "lg:grid-cols-[18.25rem_minmax(0,1fr)_19.5rem]"}`}>
    <form key={formVersion} ref={formRef} noValidate onSubmit={handleSubmit} onInput={(event) => {
      const target = event.target;
      clearValidation(event);
      if (target instanceof HTMLSelectElement && target.id === "display-currency") return;
      if (projection) setStale(true);
    }} className="contents">
      <CompoundInputSidebar advancedOpen={advancedOpen} onToggleAdvanced={() => setAdvancedOpen((value) => !value)} text={text.sidebar} locale={locale} submitting={submitting} calculatingLabel={text.sidebar.calculating} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((value) => !value)} currency={currency} onCurrencyChange={setCurrency} initialValues={restoredValues} />
      <section ref={resultsRef} tabIndex={-1} aria-label={text.header.portfolio} className="min-w-0 border-e border-border-subtle bg-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        <p aria-live="polite" aria-atomic="true" className="sr-only">{status}</p>
        {sample ? <p className="px-4 pt-3 text-xs text-secondary-foreground">{text.sampleData}</p> : null}
        {error ? <div role="alert" className="mx-4 mt-3 rounded-md border border-border-subtle px-3 py-2 text-sm">{status} <button type="submit" className="ms-2 underline">{text.retry}</button></div> : null}
        <Suspense fallback={<ProjectionSkeleton />}>
          <RequestGate promise={pendingPromise} />
          {selectedScenario ? <ProjectionResults
            isDesktop={isDesktop}
            sidebarCollapsed={sidebarCollapsed}
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
      {isDesktop ? <Suspense fallback={<InsightsSkeleton />}>
        <RequestGate promise={pendingPromise} />
        {selectedScenario ? <InsightsSidebar
          scenarios={projection.scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={setSelectedName}
          durationYears={projection.resolved_inputs.duration_years}
          locale={locale}
          currency={currency}
          text={{ scenarios: text.scenarios, composition: text.composition }}
        /> : null}
      </Suspense> : null}
    </form>
    </main>
    </>
  );
}
