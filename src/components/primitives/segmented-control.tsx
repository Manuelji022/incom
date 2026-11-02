"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

type SegmentedControlOption<Value extends string = string> = {
  value: Value;
  label: ReactNode;
  disabled?: boolean;
};

type SegmentedControlProps<Value extends string = string> = Omit<
  ComponentProps<"fieldset">,
  "children" | "onChange" | "name" | "defaultValue"
> & {
  label: ReactNode;
  name?: string;
  options: readonly SegmentedControlOption<Value>[];
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
};

function SegmentedControl<Value extends string = string>({
  label,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  optional = false,
  optionalLabel = "Optional",
  disabled,
  className = "",
  ...props
}: SegmentedControlProps<Value>) {
  const generatedName = useId();

  return (
    <fieldset
      {...props}
      disabled={disabled}
      data-slot="segmented-control"
      className={`min-w-0 ${className}`.trim()}
    >
      <legend className="mb-2 w-full text-sm font-medium leading-5 text-primary-foreground">
        <span className="flex items-center justify-between gap-3">
          <span>{label}</span>
          {optional ? (
            <span className="shrink-0 text-xs font-normal text-tertiary-foreground">
              {optionalLabel}
            </span>
          ) : null}
        </span>
      </legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-border-subtle bg-sunken p-1">
        {options.map((option) => (
          <label key={option.value} className="group/option relative min-w-0">
            <input
              type="radio"
              name={name ?? generatedName}
              value={option.value}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={
                value === undefined ? defaultValue === option.value : undefined
              }
              onChange={() => onValueChange?.(option.value)}
              disabled={disabled || option.disabled}
              required={required}
              className="peer sr-only"
            />
            <span className="flex min-h-9 cursor-pointer items-center justify-center rounded-md px-1.5 text-center text-sm font-medium leading-tight text-secondary-foreground transition-colors group-hover/option:text-primary-foreground peer-checked:bg-container peer-checked:text-primary-foreground peer-checked:shadow-default peer-checked:ring-1 peer-checked:ring-border-default peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-brand-border-focus peer-disabled:cursor-not-allowed peer-disabled:opacity-50 forced-colors:peer-checked:outline forced-colors:peer-checked:outline-2">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export { SegmentedControl };
export type { SegmentedControlOption, SegmentedControlProps };
