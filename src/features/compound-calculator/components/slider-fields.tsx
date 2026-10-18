"use client";

import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/primitives/field";
import { DecimalInput } from "@/components/primitives/decimal-input";
import { Slider } from "@/components/primitives/slider";
import { clearFieldValidation } from "@/features/compound-calculator/lib/field-validation";
import { normalizeDecimalInput } from "@/features/compound-calculator/lib/decimal-input";
import { getIntlLocale } from "@/lib/locales";

export type SliderFieldProps = {
  id: string;
  name: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  inputMax?: number;
  step: number;
  description?: string;
  valueText?: (value: number) => string;
  initialValues?: Record<string, string>;
  error?: string;
  onValueChange?: (name: string, value: string) => void;
};

function isStepAligned(value: number, min: number, step: number) {
  return (
    Math.abs((value - min) / step - Math.round((value - min) / step)) < 1e-8
  );
}

export function SliderField({
  id,
  name,
  label,
  unit,
  defaultValue,
  min,
  max,
  inputMax = max,
  step,
  description,
  valueText,
  initialValues,
  error,
  onValueChange,
}: SliderFieldProps) {
  const initialDraft = initialValues?.[name] ?? String(defaultValue);
  const parsedInitial = Number(normalizeDecimalInput(initialDraft));
  const validInitial = initialDraft !== "" && Number.isFinite(parsedInitial) && parsedInitial >= min && parsedInitial <= inputMax && isStepAligned(parsedInitial, min, step);
  const [value, setValue] = useState(validInitial ? parsedInitial : defaultValue);
  const [draft, setDraft] = useState(initialDraft);
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const labelId = `${id}-label`;

  return (
    <Field invalid={!!error}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <FieldLabel id={labelId} htmlFor={id}>
            {label}
          </FieldLabel>
        </div>
        <div className="relative w-28 shrink-0">
          <DecimalInput
            id={id}
            name={name}
            value={draft}
            min={min}
            max={inputMax}
            step={step}
            required
            aria-describedby={describedBy}
            aria-invalid={!!error}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setDraft(next);
              const parsed = Number(normalizeDecimalInput(next));
              if (
                next !== "" &&
                Number.isFinite(parsed) &&
                parsed >= min &&
                parsed <= inputMax &&
                isStepAligned(parsed, min, step)
              )
                setValue(parsed);
            }}
            className="pe-14 tabular-nums"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-tertiary-foreground"
          >
            {unit}
          </span>
        </div>
      </div>
      <Slider
        id={`${id}-slider`}
        aria-label={`${label} (${unit})`}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          setDraft(String(next));
          onValueChange?.(name, String(next));
          const field = document.getElementById(id);
          if (field instanceof HTMLInputElement) clearFieldValidation(field);
        }}
        aria-valuetext={valueText ? valueText(value) : undefined}
        className="mt-2 w-full"
      />
      <div className="flex justify-between text-xs text-tertiary-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
      {error ? <p id={errorId} className="text-sm text-danger-foreground">{error}</p> : null}
    </Field>
  );
}

export type ScenarioRangeFieldProps = {
  locale: "en" | "es";
  text: ReturnType<typeof import("@/lib/i18n").getDictionary>["sidebar"];
  id: string;
  name: string;
  label: string;
  expectedReturn: number;
  defaultSpread?: number;
  step?: number;
  maxSpread?: number;
  initialValues?: Record<string, string>;
  idPrefix?: string;
  error?: string;
  onValueChange?: (name: string, value: string) => void;
};

export function ScenarioRangeField({
  id,
  name,
  label,
  expectedReturn,
  defaultSpread = 2,
  step = 0.1,
  maxSpread = 10,
  text,
  locale,
  initialValues,
  idPrefix,
  error,
  onValueChange,
}: ScenarioRangeFieldProps) {
  const controlId = idPrefix ? `${idPrefix}-${id}` : id;
  const initialDraft = initialValues?.[name] ?? String(defaultSpread);
  const parsedInitial = Number(normalizeDecimalInput(initialDraft));
  const validInitial = initialDraft !== "" && Number.isFinite(parsedInitial) && parsedInitial >= 0 && parsedInitial <= maxSpread && isStepAligned(parsedInitial, 0, step);
  const [spread, setSpread] = useState(validInitial ? parsedInitial : defaultSpread);
  const [draft, setDraft] = useState(initialDraft);
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const errorId = error ? `${controlId}-error` : undefined;
  const format = (value: number) =>
    new Intl.NumberFormat(getIntlLocale(locale), {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);

  const updateSpread = (draft: string) => {
    const parsed = Number(normalizeDecimalInput(draft));
    if (
      draft === "" ||
      !Number.isFinite(parsed) ||
      parsed < 0 ||
      parsed > maxSpread ||
      !isStepAligned(parsed, 0, step)
    )
      return;
    setSpread(parsed);
  };

  return (
    <Field invalid={!!error}>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel id={labelId} htmlFor={controlId}>{label}</FieldLabel>
        <div className="relative w-28 shrink-0">
          <DecimalInput
            id={controlId}
            name={name}
            aria-label={`${label} (${text.rangeAmount})`}
            min="0"
            max={maxSpread}
            step={step}
            value={draft}
            required
            aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
            aria-invalid={!!error}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setDraft(next);
              updateSpread(next);
            }}
            className="pe-10 tabular-nums"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-tertiary-foreground">pp</span>
        </div>
      </div>
      <div className="mt-2 grid gap-2">
        <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
          <label htmlFor={`${controlId}-slider`} className="text-xs text-tertiary-foreground">{text.lowShort} / {text.highShort}</label>
          <Slider
            id={`${controlId}-slider`}
            aria-label={label}
            min={0}
            max={maxSpread}
            step={step}
            value={spread}
            aria-valuetext={text.rangePreview
              .replace("{low}", format(expectedReturn - spread))
              .replace("{expected}", format(expectedReturn))
              .replace("{high}", format(expectedReturn + spread))}
            aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
            aria-invalid={!!error}
            onValueChange={(next) => {
              const nextSpread = Number(next.toFixed(6));
              setSpread(nextSpread);
              setDraft(String(nextSpread));
              onValueChange?.(name, String(nextSpread));
              const field = document.getElementById(controlId);
              if (field instanceof HTMLInputElement) clearFieldValidation(field);
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 text-xs tabular-nums text-tertiary-foreground">
        <span className="text-start">
          {text.lowShort}{" "}
          <strong className="font-medium text-secondary-foreground">
            {format(expectedReturn - spread)}
          </strong>
        </span>
        <span className="text-center">
          {text.expectedShort}{" "}
          <strong className="font-medium text-secondary-foreground">
            {format(expectedReturn)}
          </strong>
        </span>
        <span className="text-end">
          {text.highShort}{" "}
          <strong className="font-medium text-secondary-foreground">
            {format(expectedReturn + spread)}
          </strong>
        </span>
      </div>
      <FieldDescription id={descriptionId}>
        {text.rangeDescription}
      </FieldDescription>
      {error ? <p id={errorId} className="text-sm text-danger-foreground">{error}</p> : null}
    </Field>
  );
}

export function ProjectionSliderFields({
  text,
  locale,
  initialValues,
  idPrefix,
  errors = {},
  onValueChange,
}: {
  locale: "en" | "es";
  text: ReturnType<typeof import("@/lib/i18n").getDictionary>["sidebar"];
  initialValues?: Record<string, string>;
  idPrefix?: string;
  errors?: Record<string, string | undefined>;
  onValueChange?: (name: string, value: string) => void;
}) {
  const returnDraftInitial = initialValues?.expected_annual_return_percent ?? "8";
  const [returnDraft, setReturnDraft] = useState(returnDraftInitial);
  const prefix = idPrefix ? `${idPrefix}-` : "";
  const durationId = `${prefix}duration-years`;
  const returnId = `${prefix}expected-annual-return`;
  const returnLabelId = `${returnId}-label`;
  const returnDescriptionId = `${returnId}-description`;

  return (
    <>
      <SliderField
        id={durationId}
        name="duration_years"
        label={text.horizon}
        unit={text.years}
        defaultValue={25}
        min={1}
        max={50}
        inputMax={100}
        step={1}
        initialValues={initialValues}
        error={errors.duration_years}
        onValueChange={onValueChange}
        valueText={(value) =>
          new Intl.NumberFormat(getIntlLocale(locale), {
            style: "unit",
            unit: "year",
            unitDisplay: "long",
          }).format(value)
        }
      />
      <Field>
        <div className="flex items-center justify-between gap-3">
          <FieldLabel
            className="min-w-0 flex-1"
            id={returnLabelId}
            htmlFor={returnId}
          >
            {text.return}
          </FieldLabel>
          <div className="relative w-28 shrink-0">
            <DecimalInput
              id={returnId}
              name="expected_annual_return_percent"
              value={returnDraft}
              step="0.1"
              required
              aria-label={`${text.return} (%)`}
              min="-100"
              max="100"
              aria-describedby={[returnDescriptionId, errors.expected_annual_return_percent ? `${returnId}-error` : ""].filter(Boolean).join(" ") || undefined}
              aria-invalid={!!errors.expected_annual_return_percent}
              onChange={(event) => {
                const draft = event.currentTarget.value;
                setReturnDraft(draft);
              }}
              className="pe-14 tabular-nums"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-tertiary-foreground"
            >
              %
            </span>
          </div>
        </div>
        <FieldDescription id={returnDescriptionId}>
          {text.beforeFees}
        </FieldDescription>
        {errors.expected_annual_return_percent ? <p id={`${returnId}-error`} className="text-sm text-danger-foreground">{errors.expected_annual_return_percent}</p> : null}
      </Field>

    </>
  );
}
