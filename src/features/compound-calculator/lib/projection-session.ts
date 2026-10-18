import { parseProjectionResponse } from "@/features/compound-calculator/api/compound-interest";
import { hasLocale, type Locale } from "@/lib/locales";
import { isCurrency, type Currency } from "@/lib/currency";
import type { CompoundInterestProjectionResponse, ProjectionScenario } from "@/features/compound-calculator/types/compound-interest";

const storageKey = "incom:projection-session:v1";

export type ProjectionSession = {
  destination: Locale;
  values: Record<string, string>;
  projection: CompoundInterestProjectionResponse;
  sample: boolean;
  selectedName: ProjectionScenario["name"];
  currency: Currency;
  stale: boolean;
  sidebarCollapsed: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProjectionSession(value: unknown): ProjectionSession | null {
  if (!isRecord(value) || typeof value.destination !== "string" || !hasLocale(value.destination) ||
      !isRecord(value.values) || typeof value.sample !== "boolean" ||
      (value.selectedName !== "low" && value.selectedName !== "expected" && value.selectedName !== "high") ||
      typeof value.currency !== "string" || !isCurrency(value.currency) ||
      typeof value.stale !== "boolean" || typeof value.sidebarCollapsed !== "boolean") return null;
  const values: Record<string, string> = {};
  for (const [name, fieldValue] of Object.entries(value.values)) {
    if (typeof fieldValue !== "string") return null;
    values[name] = fieldValue;
  }
  try {
    return {
      destination: value.destination,
      values,
      projection: parseProjectionResponse(value.projection),
      sample: value.sample,
      selectedName: value.selectedName,
      currency: value.currency,
      stale: value.stale,
      sidebarCollapsed: value.sidebarCollapsed,
    };
  } catch {
    return null;
  }
}

export function saveProjectionSession(session: ProjectionSession): boolean {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function consumeProjectionSession(locale: Locale): ProjectionSession | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    const session = parseProjectionSession(parsed);
    if (!session || session.destination !== locale) return null;
    window.sessionStorage.removeItem(storageKey);
    return session;
  } catch {
    return null;
  }
}
