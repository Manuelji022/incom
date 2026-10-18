"use client";

import type { ComponentProps } from "react";

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
          {...inputProps}
          id={id}
          name={name}
          aria-label={`${label} (${unit})`}
          defaultValue={defaultValue}
          disabled={disabled}
          onWheel={(event) => {
            onWheel?.(event);
            event.currentTarget.blur();
          }}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={`pe-14 tabular-nums ${className}`.trim()}
        />
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
