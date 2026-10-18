"use client";

import { useEffect, useState } from "react";
import { fetchProjection } from "@/features/compound-calculator/api/compound-interest";
import { mockProjection } from "@/features/compound-calculator/lib/mock-projection";
import { parseProjectionForm, validateProjectionForm, type ProjectionFormMessages } from "@/features/compound-calculator/lib/projection-form";
import { consumeProjectionSession, saveProjectionSession } from "@/features/compound-calculator/lib/projection-session";
import type { Currency } from "@/lib/currency";
import type { Locale } from "@/lib/locales";
import type { CompoundInterestProjectionResponse, ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";

type ScenarioName = ProjectionScenario["name"];
type StatusText = { calculating: string; validation: string; ready: string; invalid: string; unavailable: string; rateLimited: string };

export function useProjectionController(locale: Locale, messages: ProjectionFormMessages, text: StatusText) {
  const [projection, setProjection] = useState<CompoundInterestProjectionResponse>(mockProjection);
  const [sample, setSample] = useState(true);
  const [pendingPromise, setPendingPromise] = useState<Promise<void> | null>(null);
  const [selectedName, setSelectedName] = useState<ScenarioName>("expected");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  const [status, setStatus] = useState("");
  const [restoredValues, setRestoredValues] = useState<Record<string, string> | undefined>();
  const [formVersion, setFormVersion] = useState(0);

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

  const saveBeforeLocaleChange = (destination: Locale, form: HTMLFormElement | null) => {
    if (submitting) return { status: "pending" as const };
    const values: Record<string, string> = {};
    if (form) {
      for (const element of Array.from(form.elements)) {
        if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement) || !element.name) continue;
        if (element instanceof HTMLInputElement && (element.type === "radio" || element.type === "checkbox")) {
          if (element.checked) values[element.name] = element.value;
        } else values[element.name] = element.value;
      }
    }
    return saveProjectionSession({ destination, values, projection, sample, selectedName, currency, stale, sidebarCollapsed })
      ? { status: "saved" as const }
      : { status: "storage" as const };
  };

  const submit = async (form: HTMLFormElement, onInvalid: (fields: HTMLInputElement[]) => void, onSuccess: () => void) => {
    if (submitting) return;
    const invalid = validateProjectionForm(form, messages);
    if (invalid.length > 0) {
      setStatus(text.validation);
      onInvalid(invalid);
      return;
    }
    setSubmitting(true);
    setError(false);
    setStatus(text.calculating);
    const request = fetchProjection(parseProjectionForm(form));
    setPendingPromise(request.then(() => undefined, () => undefined));
    try {
      const result = await request;
      setProjection(result);
      setSample(false);
      setSelectedName("expected");
      setStale(false);
      setStatus("");
      if (!window.matchMedia("(min-width: 64rem)").matches) setSidebarCollapsed(true);
      onSuccess();
      return "success" as const;
    } catch (caught) {
      setError(true);
      if (caught instanceof Error && caught.message === "invalid-input") {
        setStatus(text.invalid);
      } else if (caught instanceof Error && caught.message === "rate-limited") {
        setStatus(text.rateLimited);
      } else {
        setStatus(text.unavailable);
      }
      return "error" as const;
    } finally {
      setPendingPromise(null);
      setSubmitting(false);
    }
  };

  return {
    projection, sample, pendingPromise, selectedName, setSelectedName,
    currency, setCurrency, sidebarCollapsed, setSidebarCollapsed, submitting, error,
    stale, setStale, status, restoredValues, formVersion, saveBeforeLocaleChange, submit,
  };
}
