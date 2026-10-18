import type { CompoundInterestProjectionInput } from "@/features/compound-calculator/types/compound-interest";
import { isValidDecimalInput, normalizeDecimalInput } from "@/features/compound-calculator/lib/decimal-input";

export type ProjectionFormMessages = {
  decimalInput: string;
  missingPrincipal: string;
};

export function parseProjectionForm(form: HTMLFormElement): CompoundInterestProjectionInput {
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

function isStepAligned(value: number, min: number, step: number) {
  return Math.abs((value - min) / step - Math.round((value - min) / step)) <= 1e-8;
}

export function validateProjectionForm(form: HTMLFormElement, messages: ProjectionFormMessages): HTMLInputElement[] {
  const decimalFields = Array.from(form.elements).filter(
    (element): element is HTMLInputElement => element instanceof HTMLInputElement && element.inputMode === "decimal",
  );
  for (const field of decimalFields) {
    const raw = field.value.trim();
    const normalized = normalizeDecimalInput(raw);
    const numeric = Number(normalized);
    const min = field.min === "" ? undefined : Number(field.min);
    const max = field.max === "" ? undefined : Number(field.max);
    const step = field.step === "" || field.step === "any" ? undefined : Number(field.step);
    let invalid = !isValidDecimalInput(raw) || (raw !== "" && !Number.isFinite(numeric));
    if (raw === "" && field.required) invalid = true;
    if (!invalid && raw !== "" && min !== undefined && numeric < min) invalid = true;
    if (!invalid && raw !== "" && max !== undefined && numeric > max) invalid = true;
    if (!invalid && raw !== "" && step !== undefined && !isStepAligned(numeric, min ?? 0, step)) invalid = true;
    field.setCustomValidity(invalid ? messages.decimalInput : "");
  }

  const amount = form.elements.namedItem("recurring_contribution.amount");
  const principal = form.elements.namedItem("initial_principal");
  if (amount instanceof HTMLInputElement && principal instanceof HTMLInputElement && amount.validity.valid && principal.validity.valid) {
    const priorError = principal.validationMessage;
    const missingPrincipal = (amount.value.trim() === "" || Number(normalizeDecimalInput(amount.value)) <= 0) && Number(normalizeDecimalInput(principal.value)) <= 0;
    principal.setCustomValidity(missingPrincipal ? messages.missingPrincipal : priorError);
  }
  return Array.from(form.elements).filter(
    (element): element is HTMLInputElement => element instanceof HTMLInputElement && !element.validity.valid,
  );
}
