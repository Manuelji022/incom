import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input">;

function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={`flex h-10 w-full min-w-0 rounded-md border border-border-default bg-container px-3 py-2 text-sm text-primary-foreground shadow-default outline-none transition-colors placeholder:text-tertiary-foreground focus-visible:border-brand-border-focus focus-visible:ring-2 focus-visible:ring-brand-border-focus/30 aria-invalid:border-danger-border-default aria-invalid:focus-visible:ring-danger-border-default/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-60 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary-foreground ${className}`.trim()}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
