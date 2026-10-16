"use client";

import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export type SliderFieldProps = {
  optionalLabel?: string;
  id: string;
  name: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  description?: string;
  valueText?: (value: number) => string;
  optional?: boolean;
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
  step,
  description,
  valueText,
  optional = false,
  optionalLabel = "Optional",
}: SliderFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [draft, setDraft] = useState(String(defaultValue));
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
            max={max}
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
                parsed <= max &&
                isStepAligned(parsed, min, step)
              )
                setValue(parsed);
            }}
            className="pr-14 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
        aria-labelledby={labelId}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(next) => {
          if (typeof next === "number") {
            setValue(next);
            setDraft(String(next));
          }
        }}
        thumbLabels={[label]}
        thumbDescriptionId={descriptionId}
        thumbValueTexts={
          valueText ? [(current) => valueText(current)] : undefined
        }
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
  lowerName?: string;
  upperName?: string;
  label: string;
  expectedReturn: number;
  defaultLowerSpread?: number;
  defaultUpperSpread?: number;
  step?: number;
  maxSpread?: number;
  optional?: boolean;
};

export function ScenarioRangeField({
  id,
  lowerName,
  upperName,
  label,
  expectedReturn,
  defaultLowerSpread = 2,
  defaultUpperSpread = 2,
  step = 0.1,
  maxSpread = 10,
  optional = false,
  optionalLabel = "Optional",
  text,
  locale,
}: ScenarioRangeFieldProps) {
  const [lowerSpread, setLowerSpread] = useState(defaultLowerSpread);
  const [upperSpread, setUpperSpread] = useState(defaultUpperSpread);
  const [lowerDraft, setLowerDraft] = useState(String(defaultLowerSpread));
  const [upperDraft, setUpperDraft] = useState(String(defaultUpperSpread));
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const format = (value: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);

  const updateSpread = (side: "lower" | "upper", draft: string) => {
    const parsed = Number(draft);
    if (
      draft === "" ||
      !Number.isFinite(parsed) ||
      parsed < 0 ||
      parsed > maxSpread ||
      !isStepAligned(parsed, 0, step)
    )
      return;
    if (side === "lower") setLowerSpread(parsed);
    else setUpperSpread(parsed);
  };

  return (
    <Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <FieldLabel id={labelId}>{label}</FieldLabel>
          {optional ? (
            <span className="shrink-0 text-xs font-normal text-tertiary-foreground">
              {optionalLabel}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${id}-lower`}
              className="text-xs text-tertiary-foreground"
            >
              {text.low}
            </label>
            <div className="relative w-24 shrink-0">
              <Input
                id={`${id}-lower`}
                name={lowerName}
                type="number"
                inputMode="decimal"
                min="0"
                max={maxSpread}
                step={step}
                value={lowerDraft}
                required
                aria-describedby={descriptionId}
                onChange={(event) => {
                  const next = event.currentTarget.value;
                  setLowerDraft(next);
                  updateSpread("lower", next);
                }}
                className="pr-10 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-tertiary-foreground"
              >
                pp
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${id}-upper`}
              className="text-xs text-tertiary-foreground"
            >
              {text.high}
            </label>
            <div className="relative w-24 shrink-0">
              <Input
                id={`${id}-upper`}
                name={upperName}
                type="number"
                inputMode="decimal"
                min="0"
                max={maxSpread}
                step={step}
                value={upperDraft}
                required
                aria-describedby={descriptionId}
                onChange={(event) => {
                  const next = event.currentTarget.value;
                  setUpperDraft(next);
                  updateSpread("upper", next);
                }}
                className="pr-10 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-tertiary-foreground"
              >
                pp
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-2 px-2">
        <Slider
          min={-maxSpread}
          max={maxSpread}
          step={step}
          value={[-lowerSpread, upperSpread]}
          thumbLabels={[text.lowShort, text.highShort]}
          aria-labelledby={labelId}
          thumbDescriptionId={descriptionId}
          thumbValueTexts={[
            (value) => format(expectedReturn + value),
            (value) => format(expectedReturn + value),
          ]}
          thumbCollisionBehavior="none"
          onValueChange={(next, details) => {
            if (!Array.isArray(next)) return;
            if (details.activeThumbIndex === 0) {
              const nextSpread = Math.min(
                maxSpread,
                Math.max(0, Number((-(next[0] ?? 0)).toFixed(6))),
              );
              setLowerSpread(nextSpread);
              setLowerDraft(String(nextSpread));
            } else {
              const nextSpread = Math.min(
                maxSpread,
                Math.max(0, Number((next[1] ?? 0).toFixed(6))),
              );
              setUpperSpread(nextSpread);
              setUpperDraft(String(nextSpread));
            }
          }}
          className="w-full"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-secondary-foreground/60"
        />
      </div>
      <div className="grid grid-cols-3 text-xs tabular-nums text-tertiary-foreground">
        <span className="text-left">
          {text.lowShort}{" "}
          <strong className="font-medium text-secondary-foreground">
            {format(expectedReturn - lowerSpread)}
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
            {format(expectedReturn + upperSpread)}
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
}: {
  locale: "en" | "es";
  text: ReturnType<typeof import("@/lib/i18n").getDictionary>["sidebar"];
}) {
  const [expectedReturn, setExpectedReturn] = useState(7.8);
  const [returnDraft, setReturnDraft] = useState("7.8");

  return (
    <>
      <SliderField
        id="duration-years"
        name="duration_years"
        label={text.horizon}
        unit={text.years}
        defaultValue={25}
        min={1}
        max={100}
        step={1}
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
              aria-describedby="expected-annual-return-description"
              onChange={(event) => {
                const draft = event.currentTarget.value;
                setReturnDraft(draft);
                if (draft !== "" && Number.isFinite(Number(draft)))
                  setExpectedReturn(Number(draft));
              }}
              className="pr-14 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
        label={text.range}
        expectedReturn={expectedReturn}
        defaultLowerSpread={2}
        defaultUpperSpread={2}
        step={0.1}
        maxSpread={10}
        optional
        optionalLabel={text.optional}
        text={text}
        locale={locale}
      />
    </>
  );
}
