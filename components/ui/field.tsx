import type { ComponentProps } from "react";

type FieldOrientation = "vertical" | "horizontal" | "responsive";

type FieldProps = ComponentProps<"div"> & {
  orientation?: FieldOrientation;
  invalid?: boolean;
  disabled?: boolean;
};

function FieldSet({ className = "", ...props }: ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={`flex min-w-0 flex-col gap-5 ${className}`.trim()}
      {...props}
    />
  );
}

function FieldGroup({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={`flex w-full flex-col gap-5 ${className}`.trim()}
      {...props}
    />
  );
}

function Field({
  className = "",
  orientation = "vertical",
  invalid = false,
  disabled = false,
  ...props
}: FieldProps) {
  const orientationClasses: Record<FieldOrientation, string> = {
    vertical: "flex-col",
    horizontal: "flex-col sm:flex-row sm:items-center sm:gap-6",
    responsive: "flex-col sm:flex-row sm:items-start sm:gap-6",
  };

  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={`group/field flex w-full gap-2.5 ${orientationClasses[orientation]} ${invalid ? "text-danger-foreground" : ""} ${disabled ? "opacity-60" : ""} ${className}`.trim()}
      {...props}
    />
  );
}

function FieldContent({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={`flex min-w-0 flex-1 flex-col gap-2 ${className}`.trim()}
      {...props}
    />
  );
}

function FieldLabel({ className = "", ...props }: ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={`w-fit text-sm font-medium leading-5 text-primary-foreground group-data-[disabled=true]/field:cursor-not-allowed ${className}`.trim()}
      {...props}
    />
  );
}

function FieldDescription({ className = "", ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={`text-sm leading-5 text-secondary-foreground ${className}`.trim()}
      {...props}
    />
  );
}

function FieldError({ className = "", ...props }: ComponentProps<"p">) {
  return (
    <p
      role="alert"
      data-slot="field-error"
      className={`text-sm leading-5 text-danger-foreground ${className}`.trim()}
      {...props}
    />
  );
}

export { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet };
export type { FieldProps, FieldOrientation };
