import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

function Input({ className = "", type, ...props }: InputProps) {
  const numericInputClass =
    type === "number"
      ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      : "";

  return (
    <input
      type={type}
      data-slot="input"
      className={`flex h-10 w-full min-w-0 rounded-md border border-control-border bg-container px-3 py-2 text-base text-primary-foreground shadow-default transition-colors placeholder:text-tertiary-foreground focus-visible:border-brand-border-focus focus-visible:ring-2 focus-visible:ring-brand-border-focus aria-invalid:border-danger-border-default aria-invalid:focus-visible:border-danger-border-default aria-invalid:focus-visible:ring-danger-border-default disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-60 file:me-3 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-primary-foreground ${numericInputClass} ${className}`.trim()}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
