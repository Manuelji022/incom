"use client";

import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { clearFieldValidation } from "@/lib/field-validation";

export type SliderFieldProps = {
  optionalLabel?: string;
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
  optional?: boolean;
  initialValues?: Record<string, string>;
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
  optional = false,
  optionalLabel = "Optional",
  initialValues,
}: SliderFieldProps) {
  const initialDraft = initialValues?.[name] ?? String(defaultValue);
  const parsedInitial = Number(initialDraft);
  const validInitial = initialDraft !== "" && Number.isFinite(parsedInitial) && parsedInitial >= min && parsedInitial <= inputMax && isStepAligned(parsedInitial, min, step);
  const [value, setValue] = useState(validInitial ? parsedInitial : defaultValue);
  const [draft, setDraft] = useState(initialDraft);
  const descriptionId = description ? `${id}-description` : undefined;
  const labelId = `${id}-label`;

  return (
    <Field>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <FieldLabel id={labelId} htmlFor={id}>
            {label}
          </FieldLabel>
          {optional ? (
            <span className="shrink-0 text-xs font-normal text-tertiary-foreground">
              {optionalLabel}
            </span>
          ) : null}
        </div>
        <div className="relative w-28 shrink-0">
          <Input
            id={id}
            name={name}
            type="number"
            inputMode="decimal"
            value={draft}
            min={min}
            max={inputMax}
            step={step}
            required
            aria-describedby={descriptionId}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setDraft(next);
              const parsed = Number(next);
              if (
                next !== "" &&
                Number.isFinite(parsed) &&
                parsed >= min &&
                parsed <= inputMax &&
                isStepAligned(parsed, min, step)
              )
                setValue(parsed);
            }}
            className="pr-14 tabular-nums"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-tertiary-foreground"
          >
            {unit}
          </span>
        </div>
      </div>
      <Slider
        id={`${id}-slider`}
        aria-label={`${label} (${unit})`}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          setDraft(String(next));
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
    </Field>
  );
}

export type ScenarioRangeFieldProps = {
  optionalLabel?: string;
  locale: "en" | "es";
  text: ReturnType<typeof import("@/lib/i18n").getDictionary>["sidebar"];
  id: string;
  name: string;
  label: string;
  expectedReturn: number;
  defaultSpread?: number;
  step?: number;
  maxSpread?: number;
  optional?: boolean;
  initialValues?: Record<string, string>;
};

export function ScenarioRangeField({
  id,
  name,
  label,
  expectedReturn,
  defaultSpread = 2,
  step = 0.1,
  maxSpread = 10,
  optional = false,
  optionalLabel = "Optional",
  text,
  locale,
  initialValues,
}: ScenarioRangeFieldProps) {
  const initialDraft = initialValues?.[name] ?? String(defaultSpread);
  const parsedInitial = Number(initialDraft);
  const validInitial = initialDraft !== "" && Number.isFinite(parsedInitial) && parsedInitial >= 0 && parsedInitial <= maxSpread && isStepAligned(parsedInitial, 0, step);
  const [spread, setSpread] = useState(validInitial ? parsedInitial : defaultSpread);
  const [draft, setDraft] = useState(initialDraft);
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const format = (value: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);

  const updateSpread = (draft: string) => {
    const parsed = Number(draft);
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
    <Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <FieldLabel id={labelId} htmlFor={id}>{label}</FieldLabel>
          {optional ? (
            <span className="shrink-0 text-xs font-normal text-tertiary-foreground">
              {optionalLabel}
            </span>
          ) : null}
        </div>
        <div className="relative w-28 shrink-0">
          <Input
            id={id}
            name={name}
            type="number"
            inputMode="decimal"
            aria-label={`${label} (${text.rangeAmount})`}
            min="0"
            max={maxSpread}
            step={step}
            value={draft}
            required
            aria-describedby={descriptionId}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setDraft(next);
              updateSpread(next);
            }}
            className="pr-10 tabular-nums"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-tertiary-foreground">pp</span>
        </div>
      </div>
      <div className="mt-2 grid gap-2">
        <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
          <label htmlFor={`${id}-slider`} className="text-xs text-tertiary-foreground">{text.lowShort} / {text.highShort}</label>
          <Slider
            id={`${id}-slider`}
            aria-label={label}
            min={0}
            max={maxSpread}
            step={step}
            value={spread}
            aria-valuetext={text.rangePreview
              .replace("{low}", format(expectedReturn - spread))
              .replace("{expected}", format(expectedReturn))
              .replace("{high}", format(expectedReturn + spread))}
            aria-describedby={descriptionId}
            onValueChange={(next) => {
              const nextSpread = Number(next.toFixed(6));
              setSpread(nextSpread);
              setDraft(String(nextSpread));
              const field = document.getElementById(id);
              if (field instanceof HTMLInputElement) clearFieldValidation(field);
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 text-xs tabular-nums text-tertiary-foreground">
        <span className="text-left">
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
        <span className="text-right">
          {text.highShort}{" "}
          <strong className="font-medium text-secondary-foreground">
            {format(expectedReturn + spread)}
          </strong>
        </span>
      </div>
      <FieldDescription id={descriptionId}>
        {text.rangeDescription}
      </FieldDescription>
    </Field>
  );
}

export function ProjectionSliderFields({
  text,
  locale,
  initialValues,
}: {
  locale: "en" | "es";
  text: ReturnType<typeof import("@/lib/i18n").getDictionary>["sidebar"];
  initialValues?: Record<string, string>;
}) {
  const returnDraftInitial = initialValues?.expected_annual_return_percent ?? "8";
  const [expectedReturn, setExpectedReturn] = useState(Number.isFinite(Number(returnDraftInitial)) ? Number(returnDraftInitial) : 8);
  const [returnDraft, setReturnDraft] = useState(returnDraftInitial);

  return (
    <>
      <SliderField
        id="duration-years"
        name="duration_years"
        label={text.horizon}
        unit={text.years}
        defaultValue={25}
        min={1}
        max={50}
        inputMax={100}
        step={1}
        initialValues={initialValues}
        valueText={(value) =>
          new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", {
            style: "unit",
            unit: "year",
            unitDisplay: "long",
          }).format(value)
        }
      />
      <Field>
        <div className="flex items-center justify-between gap-3">
          <FieldLabel
            id="expected-annual-return-label"
            htmlFor="expected-annual-return"
          >
            {text.return}
          </FieldLabel>
          <div className="relative w-28 shrink-0">
            <Input
              id="expected-annual-return"
              name="expected_annual_return_percent"
              type="number"
              inputMode="decimal"
              value={returnDraft}
              step="0.1"
              required
              aria-label={`${text.return} (%)`}
              min="-100"
              max="100"
              aria-describedby="expected-annual-return-description"
              onChange={(event) => {
                const draft = event.currentTarget.value;
                setReturnDraft(draft);
                if (draft !== "" && Number.isFinite(Number(draft)))
                  setExpectedReturn(Number(draft));
              }}
              className="pr-14 tabular-nums"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-tertiary-foreground"
            >
              %
            </span>
          </div>
        </div>
        <FieldDescription id="expected-annual-return-description">
          {text.beforeFees}
        </FieldDescription>
      </Field>
      <ScenarioRangeField
        id="scenario-range"
        name="scenario_range_percentage_points"
        label={text.range}
        expectedReturn={expectedReturn}
        defaultSpread={2}
        step={0.1}
        maxSpread={10}
        text={text}
        locale={locale}
        initialValues={initialValues}
      />
    </>
  );
}
