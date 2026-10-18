"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type MutableRefObject } from "react";
import { TargetResults } from "@/features/compound-calculator/components/target-results";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { NumericField } from "@/components/primitives/numeric-field";
import { Select } from "@/components/primitives/select";
import { Field, FieldDescription, FieldLabel } from "@/components/primitives/field";
import { fetchTarget, TargetApiError, parseTargetResponse, targetInputFromForm, validateTargetInput } from "@/features/compound-calculator/lib/compound-interest-target";
import { currencies, getCurrencySymbol, isCurrency, type Currency } from "@/lib/currency";
import type { getDictionary } from "@/lib/i18n";
import type { getTargetText } from "@/features/compound-calculator/lib/target-i18n";
import type { Locale } from "@/lib/locales";
import type { ProblemDetail, TargetResponse } from "@/features/compound-calculator/types/compound-interest-target";
import { ProjectionSliderFields, ScenarioRangeField } from "@/features/compound-calculator/components/slider-fields";

type Props = { locale: Locale; text: ReturnType<typeof getDictionary>; targetText: ReturnType<typeof getTargetText>; saveRef?: MutableRefObject<() => boolean>; onStatusChange?: (status: { stale: boolean; submitting: boolean }) => void; className?: string; active?: boolean };
const sessionKey = "incom:target-session:v1";
const defaults: Record<string, string> = { target_amount: "100000", initial_principal: "0", duration_years: "20", expected_annual_return_percent: "7", "contribution_plan.frequency": "monthly", "contribution_plan.timing": "end", target_basis: "nominal" };

export function TargetPlanner({ locale, text, targetText: t, saveRef, onStatusChange, className = "", active = true }: Props) {
  const [values, setValues] = useState(defaults);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [result, setResult] = useState<TargetResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProblemDetail["errors"]>([]);
  const [failure, setFailure] = useState("");
  const [status, setStatus] = useState("");
  const [stale, setStale] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null");
      if (!saved || typeof saved !== "object" || !saved.values || typeof saved.values !== "object" || !Object.values(saved.values).every((value) => typeof value === "string")) return;
      const restored = saved.result ? parseTargetResponse(saved.result) : null;
      queueMicrotask(() => {
        setValues({ ...defaults, ...saved.values });
        if (isCurrency(saved.currency)) setCurrency(saved.currency);
        setResult(restored);
        setStale(saved.stale === true);
        setFormVersion((version) => version + 1);
      });
    } catch { /* A missing or outdated saved session leaves the default form intact. */ }
  }, []);

  useEffect(() => onStatusChange?.({ stale, submitting }), [stale, submitting, onStatusChange]);

  const saveSession = useCallback(() => {
    if (inFlight.current) return false;
    const currentValues = { ...values };
    if (formRef.current) {
      for (const element of Array.from(formRef.current.elements)) {
        if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement) || !element.name) continue;
        if (element instanceof HTMLInputElement && (element.type === "radio" || element.type === "checkbox")) {
          if (element.checked) currentValues[element.name] = element.value;
        } else currentValues[element.name] = element.value;
      }
    }
    try { sessionStorage.setItem(sessionKey, JSON.stringify({ values: currentValues, result, currency, stale })); return true; }
    catch { return false; }
  }, [values, result, currency, stale]);
  useEffect(() => {
    if (saveRef) saveRef.current = saveSession;
  }, [saveRef, saveSession]);
  function update(name: string, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => previous.filter((error) => error.field !== name));
    setFailure("");
    setStatus("");
    if (result) setStale(true);
  }
  function showErrors(next: ProblemDetail["errors"]) {
    setErrors(next);
    setAdvanced(true);
    window.requestAnimationFrame(() => {
      const first = formRef.current?.elements.namedItem(next[0]?.field ?? "");
      if (first instanceof HTMLElement) first.focus();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const input = targetInputFromForm(new FormData(event.currentTarget));
    const invalid = validateTargetInput(input);
    setFailure("");
    if (invalid.length) { showErrors(invalid); setFailure(t.invalid); setStatus(t.invalid); return; }
    inFlight.current = true;
    setSubmitting(true);
    setErrors([]);
    setStatus(text.sidebar.calculating);
    try {
      const next = await fetchTarget(input);
      setResult(next);
      setStale(false);
      setStatus(t.ready);
      window.requestAnimationFrame(() => { resultRef.current?.focus(); });
    } catch (error) {
      const problem = error instanceof TargetApiError ? error.problem : null;
      const message = problem && (problem.status === 400 || problem.status === 422) ? problem.detail : t.failed;
      setFailure(message);
      setStatus("");
      if (problem?.errors.length) showErrors(problem.errors);
      if (result) setStale(true);
    } finally { inFlight.current = false; setSubmitting(false); }
  }

  const fieldLabels: Record<string, string> = {
    target_amount: t.target, target_basis: t.basis, initial_principal: text.sidebar.initial,
    duration_years: text.sidebar.horizon, expected_annual_return_percent: text.sidebar.return,
    expected_annual_inflation_percent: text.sidebar.inflation, annual_fee_percent: text.sidebar.fee,
    scenario_range_percentage_points: text.sidebar.range,
    "contribution_plan.frequency": text.sidebar.frequency, "contribution_plan.timing": text.sidebar.timing,
    "contribution_plan.annual_increase_percent": text.sidebar.increase,
  };
  const errorFor = (name: string) => errors.find((error) => error.field === name)?.reason;
  function field(name: string, label: string, description?: string, placeholder?: string) {
    const id = `target-${name.replaceAll(".", "-")}`;
    const error = errorFor(name);
    return <Field key={name} invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} name={name} type="text" inputMode={name === "duration_years" ? "numeric" : "decimal"} value={values[name] ?? ""} onChange={(event) => update(name, event.currentTarget.value)} placeholder={placeholder} aria-required={["target_amount", "initial_principal", "duration_years", "expected_annual_return_percent"].includes(name) || (name === "expected_annual_inflation_percent" && values.target_basis === "real")} aria-invalid={!!error} aria-describedby={[description ? `${id}-description` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined} className="tabular-nums" />
      {description ? <FieldDescription id={`${id}-description`}>{description}</FieldDescription> : null}
      {error ? <p id={`${id}-error`} className="text-sm text-danger-foreground">{error}</p> : null}
    </Field>;
  }
  function select(name: string, label: string, options: { value: string; label: string }[], description?: string) {
    const id = `target-${name.replaceAll(".", "-")}`;
    const error = errorFor(name);
    return <Field invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select id={id} name={name} value={values[name]} onChange={(event) => update(name, event.currentTarget.value)} aria-invalid={!!error} aria-describedby={[description ? `${id}-description` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
      {description ? <FieldDescription id={`${id}-description`}>{description}</FieldDescription> : null}
      {error ? <p id={`${id}-error`} className="text-sm text-danger-foreground">{error}</p> : null}
    </Field>;
  }
  return <main id={active ? "main-content" : undefined} hidden={!active} tabIndex={-1} className={`grid flex-1 grid-cols-1 lg:grid-cols-[18.25rem_minmax(0,1fr)] ${className}`}>
      <form key={formVersion} ref={formRef} onSubmit={submit} onInput={(event) => { const target = event.target; if ((target instanceof HTMLInputElement || target instanceof HTMLSelectElement) && target.name) update(target.name, target.value); }} noValidate className="min-w-0 border-e border-border-default bg-container">
        <div className="space-y-2 border-b border-border-subtle p-4"><h1 className="text-base font-semibold">{t.title}</h1><p className="text-sm text-secondary-foreground">{t.intro}</p></div>
        <fieldset disabled={submitting} className="space-y-5 p-4">
          <Field><FieldLabel htmlFor="target-currency">{text.sidebar.currency}</FieldLabel><Select id="target-currency" value={currency} onChange={(event) => { if (isCurrency(event.currentTarget.value)) setCurrency(event.currentTarget.value); }} aria-describedby="target-currency-help">{currencies.map((value) => <option key={value} value={value}>{value} ({getCurrencySymbol(value)})</option>)}</Select><FieldDescription id="target-currency-help">{t.currencyHelp}</FieldDescription></Field>
          {field("target_amount", `${t.target} (${getCurrencySymbol(currency)})`, t.formatHelp)}
          {select("target_basis", t.basis, [{ value: "nominal", label: t.nominal }, { value: "real", label: t.real }], t.basisHelp)}
          {field("initial_principal", `${text.sidebar.initial} (${getCurrencySymbol(currency)})`, t.initialHelp)}
          <ProjectionSliderFields text={text.sidebar} locale={locale} initialValues={values} idPrefix="target" errors={Object.fromEntries(errors.map((error) => [error.field, error.reason]))} onValueChange={update} />
          {select("contribution_plan.frequency", text.sidebar.frequency, ["monthly", "quarterly", "annual"].map((value) => ({ value, label: text.sidebar[value as "monthly" | "quarterly" | "annual"] })))}
          <details open={advanced} onToggle={(event) => setAdvanced(event.currentTarget.open)} className="border-t border-border-subtle pt-4">
            <summary className="cursor-pointer text-sm font-semibold">{t.advanced}</summary>
            <div className="mt-4 space-y-5"><p className="text-sm text-secondary-foreground">{t.defaults}</p>
              {select("contribution_plan.timing", text.sidebar.timing, [{ value: "end", label: text.sidebar.end }, { value: "beginning", label: text.sidebar.beginning }])}
              <NumericField id="target-inflation" name="expected_annual_inflation_percent" label={`${text.sidebar.inflation} (%)`} unit="%" defaultValue={values.expected_annual_inflation_percent ?? ""} min="-100" step="0.1" description={t.inflationHelp} error={errorFor("expected_annual_inflation_percent")} required={values.target_basis === "real"} aria-required={values.target_basis === "real"} optional={values.target_basis !== "real"} optionalLabel={text.sidebar.optional} />
              <NumericField id="target-fee" name="annual_fee_percent" label={`${text.sidebar.fee} (%)`} unit="%" defaultValue={values.annual_fee_percent ?? ""} min="0" step="0.01" description={t.feeHelp} error={errorFor("annual_fee_percent")} optional optionalLabel={text.sidebar.optional} />
              <ScenarioRangeField id="scenario-range" idPrefix="target" name="scenario_range_percentage_points" label={text.sidebar.range} expectedReturn={Number(values.expected_annual_return_percent)} text={text.sidebar} locale={locale} initialValues={values} error={errorFor("scenario_range_percentage_points")} onValueChange={update} />
              {field("contribution_plan.annual_increase_percent", `${text.sidebar.increase} (%)`, t.increaseHelp, "0")}
            </div>
          </details>
          <Button type="submit" disabled={submitting} className="min-h-12 w-full">{submitting ? text.sidebar.calculating : t.calculate}</Button>
        </fieldset>
      </form>
      <section ref={resultRef} tabIndex={-1} aria-label={t.title} aria-busy={submitting} className="min-w-0 bg-page focus-visible:outline-2 focus-visible:outline-brand-border-focus">
        <p role="status" aria-atomic="true" className={status ? "p-4 text-sm text-secondary-foreground" : "sr-only"}>{status}</p>
        {failure ? <div role="alert" className="m-4 space-y-2 rounded-md border border-danger-border-default p-4 text-sm"><p>{failure}</p>{errors.length ? <ul className="list-disc ps-5">{errors.map((error, index) => <li key={`${error.field}-${index}`}>{fieldLabels[error.field] ? `${fieldLabels[error.field]}: ` : ""}{error.reason}</li>)}</ul> : null}<Button type="button" variant="outline" onClick={() => formRef.current?.requestSubmit()}>{text.retry}</Button></div> : null}
        {stale ? <p className="px-4 py-3 text-sm text-secondary-foreground">{t.stale}</p> : null}
        {result ? <TargetResults key={result.metadata.calculated_at} result={result} locale={locale} currency={currency} text={text} targetText={t} /> : <div className="mx-auto flex min-h-80 max-w-xl flex-col justify-center gap-4 p-6"><h2 className="text-xl font-semibold">{t.title}</h2><p className="text-secondary-foreground">{t.empty}</p><p className="text-sm text-secondary-foreground">{t.caveat}</p></div>}
      </section>
    </main>;
}
