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
};

function SegmentedControl<Value extends string = string>({
  label,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
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
      <legend className="mb-2.5 text-sm font-medium leading-5 text-primary-foreground">
        {label}
      </legend>
      <div className="grid auto-cols-fr grid-flow-col gap-2">
        {options.map((option) => (
          <label key={option.value} className="group/option relative min-w-0">
            <input
              type="radio"
              name={name ?? generatedName}
              value={option.value}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={value === undefined ? defaultValue === option.value : undefined}
              onChange={() => onValueChange?.(option.value)}
              disabled={disabled || option.disabled}
              required={required}
              className="peer sr-only"
            />
            <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-transparent bg-component px-1 text-center text-sm font-medium text-primary-foreground group-hover/option:bg-component-hover peer-checked:bg-inverted-solid peer-checked:text-on-inverted-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-border-focus peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
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
