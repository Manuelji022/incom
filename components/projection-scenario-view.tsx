"use client";

import { Suspense, use, useRef, useState, type FormEvent, type SyntheticEvent } from "react";
import { InsightsSidebar } from "@/components/insights-sidebar";
import { ProjectionResults } from "@/components/projection-results";
import { CompoundInputSidebar } from "@/components/compound-input-sidebar";
import { fetchProjection } from "@/lib/compound-interest";
import { mockProjection } from "@/lib/mock-projection";
import type { Locale } from "@/lib/locales";
import type { getDictionary } from "@/lib/i18n";
import type { CompoundInterestProjectionInput, CompoundInterestProjectionResponse, ProjectionScenario } from "@/types/compound-interest";

type Dictionary = ReturnType<typeof getDictionary>;
type ScenarioName = ProjectionScenario["name"];
type CompositionDictionary = Dictionary["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };
type ProjectionScenarioViewProps = {
  locale: Locale;
  text: Pick<Dictionary, "header" | "chart" | "summary" | "scenarios" | "sidebar" | "unavailable" | "invalidInputs" | "staleResults" | "retry" | "validation" | "resultsReady"> & {
    composition: CompositionText;
  };
};

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
  const amount = get("recurring_contribution.amount");
  const frequency = get("recurring_contribution.frequency");
  const timing = get("recurring_contribution.timing");
  const optional = (name: string) => {
    const value = get(name);
    return value === "" ? undefined : value;
  };
  const input: CompoundInterestProjectionInput = {
    initial_principal: get("initial_principal"),
    duration_years: Number(get("duration_years")),
    expected_annual_return_percent: get("expected_annual_return_percent"),
    ...(optional("annual_fee_percent") === undefined ? {} : { annual_fee_percent: optional("annual_fee_percent") }),
    ...(optional("expected_annual_inflation_percent") === undefined ? {} : { expected_annual_inflation_percent: optional("expected_annual_inflation_percent") }),
    ...(optional("scenario_range_percentage_points") === undefined ? {} : { scenario_range_percentage_points: optional("scenario_range_percentage_points") }),
  };
  if (amount !== "" && Number(amount) > 0) {
    input.recurring_contribution = {
      amount,
      frequency: frequency === "quarterly" || frequency === "annual" ? frequency : "monthly",
      timing: timing === "beginning" ? "beginning" : "end",
      ...(optional("recurring_contribution.annual_increase_percent") === undefined ? {} : { annual_increase_percent: optional("recurring_contribution.annual_increase_percent") }),
    };
  }
  return input;
}

export function ProjectionScenarioView({ locale, text }: ProjectionScenarioViewProps) {
  const [projection, setProjection] = useState<CompoundInterestProjectionResponse>(mockProjection);
  const [sample, setSample] = useState(true);
  const [pendingPromise, setPendingPromise] = useState<Promise<void> | null>(null);
  const [selectedName, setSelectedName] = useState<ScenarioName>("expected");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  const [status, setStatus] = useState("");
  const resultsRef = useRef<HTMLElement>(null);
  const selectedScenario = projection?.scenarios.find((scenario) => scenario.name === selectedName);

  const clearValidation = (event: SyntheticEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    target.removeAttribute("aria-invalid");
    if (target instanceof HTMLInputElement) target.setCustomValidity("");
    if (submitting) return;
    const errorId = `${target.id}-inline-error`;
    document.getElementById(errorId)?.remove();
    const describedBy = target.getAttribute("aria-describedby")?.split(" ").filter((id) => id !== errorId).join(" ");
    if (describedBy) target.setAttribute("aria-describedby", describedBy);
    else target.removeAttribute("aria-describedby");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const amount = form.elements.namedItem("recurring_contribution.amount");
    const principal = form.elements.namedItem("initial_principal");
    if (amount instanceof HTMLInputElement && principal instanceof HTMLInputElement) {
      principal.setCustomValidity((amount.value.trim() === "" || Number(amount.value) <= 0) && Number(principal.value) <= 0
        ? (locale === "es" ? "La inversión inicial debe ser mayor que cero si no hay aportaciones." : "Initial investment must be greater than zero when there are no contributions.")
        : "");
    }
    if (!form.checkValidity()) {
      const invalid = Array.from(form.elements).filter((element): element is HTMLInputElement => element instanceof HTMLInputElement && !element.validity.valid);
      for (const field of invalid) {
        const message = field.validationMessage;
        field.setAttribute("aria-invalid", "true");
        const errorId = `${field.id}-inline-error`;
        field.setAttribute("aria-describedby", [field.getAttribute("aria-describedby"), errorId].filter(Boolean).join(" "));
        if (!document.getElementById(errorId)) {
          const detail = document.createElement("p");
          detail.id = errorId;
          detail.className = "mt-1 text-xs text-danger-foreground";
          detail.textContent = message;
          field.parentElement?.insertAdjacentElement("afterend", detail);
        }
      }
      setStatus(text.validation);
      invalid[0]?.focus();
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
      window.setTimeout(() => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
          resultsRef.current?.focus({ preventScroll: true });
        }
      }, 0);
    } catch (caught) {
      setError(true);
      const rejected = caught instanceof Error && caught.message === "invalid-input";
      setStatus(rejected ? text.invalidInputs : text.unavailable);
    } finally {
      setPendingPromise(null);
      setSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} onInput={(event) => {
      clearValidation(event);
      if (projection) setStale(true);
    }} className="contents">
      <CompoundInputSidebar text={text.sidebar} locale={locale} submitting={submitting} calculatingLabel={text.sidebar.calculating} />
      <section ref={resultsRef} tabIndex={-1} aria-label={text.header.portfolio} className="min-w-0 border-e border-border-subtle bg-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        <p aria-live="polite" aria-atomic="true" className="sr-only">{status}</p>
        {sample ? <p className="px-5 pt-2 text-xs text-secondary-foreground">{locale === "es" ? "Datos de ejemplo" : "Sample data"}</p> : null}
        {stale ? <p role="status" className="mx-5 mt-3 rounded-md border border-border-subtle px-3 py-2 text-sm">{text.staleResults}</p> : null}
        {error ? <div role="alert" className="mx-5 mt-3 rounded-md border border-border-subtle px-3 py-2 text-sm">{status} <button type="submit" className="ms-2 underline">{text.retry}</button></div> : null}
        <Suspense fallback={<ProjectionSkeleton />}>
          <RequestGate promise={pendingPromise} />
          {selectedScenario ? <ProjectionResults
            selectedScenario={selectedScenario}
            durationYears={projection.resolved_inputs.duration_years}
            inflationPercent={projection.resolved_inputs.expected_annual_inflation_percent.value}
            locale={locale}
            text={{ header: text.header, chart: text.chart, summary: text.summary, scenarioLabel: text.scenarios[selectedName] }}
          /> : null}
        </Suspense>
      </section>
      <Suspense fallback={<InsightsSkeleton />}>
        <RequestGate promise={pendingPromise} />
        <InsightsSidebar
          scenarios={projection.scenarios}
          selectedScenario={selectedName}
          onSelectScenario={setSelectedName}
          durationYears={projection.resolved_inputs.duration_years}
          locale={locale}
          text={{ scenarios: text.scenarios, composition: text.composition }}
        />
      </Suspense>
    </form>
  );
}
