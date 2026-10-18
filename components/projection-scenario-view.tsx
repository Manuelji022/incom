"use client";

import { Suspense, use, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type SyntheticEvent } from "react";
import { Header } from "@/components/header";
import { InsightsSidebar } from "@/components/insights-sidebar";
import { ProjectionResults } from "@/components/projection-results";
import { CompoundInputSidebar } from "@/components/compound-input-sidebar";
import { fetchProjection } from "@/lib/compound-interest";
import { mockProjection } from "@/lib/mock-projection";
import type { Currency } from "@/lib/currency";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import type { CompoundInterestProjectionInput, CompoundInterestProjectionResponse, ProjectionScenario } from "@/types/compound-interest";
import { clearFieldValidation, showFieldValidation } from "@/lib/field-validation";
import { isValidDecimalInput, normalizeDecimalInput } from "@/lib/decimal-input";
import { consumeProjectionSession, saveProjectionSession } from "@/lib/projection-session";

type Dictionary = ReturnType<typeof getDictionary>;
type ScenarioName = ProjectionScenario["name"];
type CompositionDictionary = Dictionary["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };
type ProjectionScenarioViewProps = {
  locale: Locale;
  languageLabel: string;
  themeLabel: string;
  text: Pick<Dictionary, "header" | "chart" | "summary" | "scenarios" | "sidebar" | "unavailable" | "rateLimited" | "invalidInputs" | "staleResults" | "retry" | "validation" | "resultsReady"> & {
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

function inputFromForm(form: HTMLFormElement): CompoundInterestProjectionInput {
  const values = new FormData(form);
  const get = (name: string) => String(values.get(name) ?? "").trim();
  const decimal = (name: string) => normalizeDecimalInput(get(name));
  const amount = get("recurring_contribution.amount");
  const frequency = get("recurring_contribution.frequency");
  const timing = get("recurring_contribution.timing");
  const input: CompoundInterestProjectionInput = {
    initial_principal: decimal("initial_principal"),
    duration_years: Number(decimal("duration_years")),
    expected_annual_return_percent: decimal("expected_annual_return_percent"),
    ...(decimal("annual_fee_percent") === "" ? {} : { annual_fee_percent: decimal("annual_fee_percent") }),
    ...(decimal("expected_annual_inflation_percent") === "" ? {} : { expected_annual_inflation_percent: decimal("expected_annual_inflation_percent") }),
    ...(decimal("scenario_range_percentage_points") === "" ? {} : { scenario_range_percentage_points: decimal("scenario_range_percentage_points") }),
  };
  if (amount !== "" && Number(normalizeDecimalInput(amount)) > 0) {
    input.recurring_contribution = {
      amount: normalizeDecimalInput(amount),
      frequency: frequency === "quarterly" || frequency === "annual" ? frequency : "monthly",
      timing: timing === "beginning" ? "beginning" : "end",
      ...(decimal("recurring_contribution.annual_increase_percent") === "" ? {} : { annual_increase_percent: decimal("recurring_contribution.annual_increase_percent") }),
    };
  }
  return input;
}

export function ProjectionScenarioView({ locale, languageLabel, themeLabel, text }: ProjectionScenarioViewProps) {
  const [projection, setProjection] = useState<CompoundInterestProjectionResponse>(mockProjection);
  const [sample, setSample] = useState(true);
  const [pendingPromise, setPendingPromise] = useState<Promise<void> | null>(null);
  const [selectedName, setSelectedName] = useState<ScenarioName>("expected");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getServerDesktopSnapshot);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [restoredValues, setRestoredValues] = useState<Record<string, string> | undefined>();
  const [formVersion, setFormVersion] = useState(0);
  const resultsRef = useRef<HTMLElement>(null);
  const revealResults = useRef(false);
  const selectedScenario = projection?.scenarios.find((scenario) => scenario.name === selectedName);

  useEffect(() => {
    const session = consumeProjectionSession(locale);
    if (!session) return;
    queueMicrotask(() => {
      setRestoredValues(session.values);
      setProjection(session.projection);
      setSample(session.sample);
      setSelectedName(session.selectedName);
      setCurrency(session.currency);
      setStale(session.stale);
      setSidebarCollapsed(session.sidebarCollapsed);
      setFormVersion((version) => version + 1);
      document.getElementById("main-content")?.focus();
    });
  }, [locale]);

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

  const saveBeforeLocaleChange = (destination: Locale) => {
    if (submitting) return false;
    const values: Record<string, string> = {};
    if (formRef.current) {
      for (const element of Array.from(formRef.current.elements)) {
        if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement) || !element.name) continue;
        if (element instanceof HTMLInputElement && (element.type === "radio" || element.type === "checkbox")) {
          if (element.checked) values[element.name] = element.value;
        } else values[element.name] = element.value;
      }
    }
    return saveProjectionSession({ destination, values, projection, sample, selectedName, currency, stale, sidebarCollapsed });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const decimalFields = Array.from(form.elements).filter(
      (element): element is HTMLInputElement => element instanceof HTMLInputElement && element.inputMode === "decimal",
    );
    for (const field of decimalFields) {
      const raw = field.value.trim();
      const value = normalizeDecimalInput(raw);
      const numeric = Number(value);
      const min = field.min === "" ? undefined : Number(field.min);
      const max = field.max === "" ? undefined : Number(field.max);
      const step = field.step === "" || field.step === "any" ? undefined : Number(field.step);
      let invalid = !isValidDecimalInput(raw) || (raw !== "" && !Number.isFinite(numeric));
      if (raw === "" && field.required) invalid = true;
      if (!invalid && raw !== "" && min !== undefined && numeric < min) invalid = true;
      if (!invalid && raw !== "" && max !== undefined && numeric > max) invalid = true;
      if (!invalid && raw !== "" && step !== undefined && Math.abs((numeric - (min ?? 0)) / step - Math.round((numeric - (min ?? 0)) / step)) > 1e-8) invalid = true;
      field.setCustomValidity(invalid
        ? (locale === "es" ? "Introduce un número válido dentro del rango permitido." : "Enter a valid number within the allowed range.")
        : "");
    }
    const amount = form.elements.namedItem("recurring_contribution.amount");
    const principal = form.elements.namedItem("initial_principal");
    if (amount instanceof HTMLInputElement && principal instanceof HTMLInputElement && amount.validity.valid && principal.validity.valid) {
      const priorError = principal.validationMessage;
      const missingPrincipal = (amount.value.trim() === "" || Number(normalizeDecimalInput(amount.value)) <= 0) && Number(normalizeDecimalInput(principal.value)) <= 0;
      principal.setCustomValidity(missingPrincipal
        ? (locale === "es" ? "La inversión inicial debe ser mayor que cero si no hay aportaciones." : "Initial investment must be greater than zero when there are no contributions.")
        : priorError);
    }
    if (!form.checkValidity()) {
      const invalid = Array.from(form.elements).filter((element): element is HTMLInputElement => element instanceof HTMLInputElement && !element.validity.valid);
      for (const field of invalid) {
        showFieldValidation(field, locale);
      }
      setStatus(text.validation);
      const firstInvalid = invalid[0];
      if (firstInvalid?.closest("#advanced-assumption-fields")) setAdvancedOpen(true);
      if (sidebarCollapsed) setSidebarCollapsed(false);
      window.requestAnimationFrame(() => firstInvalid?.focus());
      return;
    }
    setSubmitting(true);
    setError(false);
    setStatus(text.sidebar.calculating);
    const request = fetchProjection(inputFromForm(form));
    setPendingPromise(request.then(() => undefined, () => undefined));
    try {
      const result = await request;
      setProjection(result);
      setSample(false);
      setSelectedName("expected");
      setStale(false);
      setStatus(text.resultsReady);
      if (!window.matchMedia(desktopQuery).matches) setSidebarCollapsed(true);
      revealResults.current = true;
    } catch (caught) {
      setError(true);
      const rejected = caught instanceof Error && caught.message === "invalid-input";
      const rateLimited = caught instanceof Error && caught.message === "rate-limited";
      setStatus(rejected ? text.invalidInputs : rateLimited ? text.rateLimited : text.unavailable);
    } finally {
      setPendingPromise(null);
      setSubmitting(false);
    }
  };

  return (
    <>
    <Header locale={locale} languageLabel={languageLabel} themeLabel={themeLabel} stale={stale} staleText={text.staleResults} onBeforeLanguageChange={saveBeforeLocaleChange} submitting={submitting} />
    <main id="main-content" tabIndex={-1} className={`grid flex-1 grid-cols-1 lg:min-h-[65.125rem] ${sidebarCollapsed ? "lg:grid-cols-[2.5rem_minmax(0,1fr)_19.5rem]" : "lg:grid-cols-[18.25rem_minmax(0,1fr)_19.5rem]"}`}>
    <form key={formVersion} ref={formRef} noValidate onSubmit={handleSubmit} onInput={(event) => {
      const target = event.target;
      clearValidation(event);
      if (target instanceof HTMLSelectElement && target.id === "display-currency") return;
      if (projection) setStale(true);
    }} className="contents">
      <CompoundInputSidebar advancedOpen={advancedOpen} onToggleAdvanced={() => setAdvancedOpen((value) => !value)} text={text.sidebar} locale={locale} submitting={submitting} calculatingLabel={text.sidebar.calculating} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((value) => !value)} currency={currency} onCurrencyChange={setCurrency} initialValues={restoredValues} />
      <section ref={resultsRef} tabIndex={-1} aria-label={text.header.portfolio} className="min-w-0 border-e border-border-subtle bg-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        <p aria-live="polite" aria-atomic="true" className="sr-only">{status}</p>
        {sample ? <p className="px-4 pt-3 text-xs text-secondary-foreground">{locale === "es" ? "Datos de ejemplo" : "Sample data"}</p> : null}
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
        <InsightsSidebar
          scenarios={projection.scenarios}
          selectedScenario={selectedName}
          onSelectScenario={setSelectedName}
          durationYears={projection.resolved_inputs.duration_years}
          locale={locale}
          currency={currency}
          text={{ scenarios: text.scenarios, composition: text.composition }}
        />
      </Suspense> : null}
    </form>
    </main>
    </>
  );
}
