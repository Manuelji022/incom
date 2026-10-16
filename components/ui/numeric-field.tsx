import type { ComponentProps } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type NumericFieldProps = {
  id: string;
  label: string;
  name: string;
  unit: string;
  description?: string;
} & Omit<
  ComponentProps<typeof Input>,
  "id" | "name" | "type"
>;

function NumericField({
  id,
  label,
  name,
  unit,
  defaultValue,
  description,
  className = "",
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: NumericFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(" ") || undefined;

  return (
    <Field disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          {...inputProps}
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          defaultValue={defaultValue}
          disabled={disabled}
          aria-describedby={describedBy}
          className={`pr-14 tabular-nums ${className}`.trim()}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-tertiary-foreground"
        >
          {unit}
        </span>
      </div>
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  );
}

export { NumericField };
export type { NumericFieldProps };
