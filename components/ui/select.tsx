import type { ComponentProps } from "react";

type SelectProps = ComponentProps<"select">;

function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      data-slot="select"
      className={`h-10 w-full min-w-0 rounded-md border border-control-border bg-container px-3 py-2 text-base text-primary-foreground transition-colors focus-visible:border-brand-border-focus focus-visible:ring-2 focus-visible:ring-brand-border-focus aria-invalid:border-danger-border-default disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-60 ${className}`.trim()}
      {...props}
    />
  );
}

export { Select };
export type { SelectProps };
