"use client";

import { useState, type ComponentProps } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/primitives/field";
import { DecimalInput } from "@/components/primitives/decimal-input";

type NumericFieldProps = {
  id: string;
  label: string;
  name: string;
  unit: string;
  description?: string;
  optional?: boolean;
  optionalLabel?: string;
  error?: string;
} & Omit<ComponentProps<typeof DecimalInput>, "id" | "name" | "type">;

function NumericField({
  id,
  label,
  name,
  unit,
  defaultValue,
  description,
  optional = false,
  optionalLabel = "Optional",
  error,
  className = "",
  disabled,
  onWheel,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: NumericFieldProps) {
  const controlledValue = inputProps.value;
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ""));
  const rawValue = String(controlledValue ?? uncontrolledValue);
  const formatValue = (value: string) => {
    const normalized = value.replaceAll(",", "");
    const [integer, ...fractionParts] = normalized.split(".");
    // Keep a useful leading zero while the user enters a fractional amount,
    // and preserve the fractional digits (including trailing zeroes).
    const whole = integer || (fractionParts.length ? "0" : "");
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fractionParts.length ? `${grouped}.${fractionParts.join("")}` : grouped;
  };
  const { value: _value, onChange, ...restInputProps } = inputProps;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <Field disabled={disabled} invalid={!!error}>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {optional ? (
          <span className="shrink-0 text-xs font-normal text-tertiary-foreground">
            {optionalLabel}
          </span>
        ) : null}
      </div>
      <div className="relative">
        <DecimalInput
          {...restInputProps}
          id={id}
          name={`${name}-display`}
          placeholder="0.00"
          value={formatValue(rawValue)}
          onChange={(event) => {
            const next = event.currentTarget.value.replaceAll(",", "");
            if (controlledValue === undefined) setUncontrolledValue(next);
            onChange?.({ ...event, currentTarget: { value: next }, target: { value: next } } as typeof event);
          }}
          disabled={disabled}
          onWheel={(event) => {
            onWheel?.(event);
            event.currentTarget.blur();
          }}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={`pe-14 tabular-nums ${className}`.trim()}
        />
        <input type="hidden" name={name} value={rawValue} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-tertiary-foreground"
        >
          {unit}
        </span>
      </div>
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
      {error ? <p id={errorId} className="text-sm text-danger-foreground">{error}</p> : null}
    </Field>
  );
}

export { NumericField };
export type { NumericFieldProps };
