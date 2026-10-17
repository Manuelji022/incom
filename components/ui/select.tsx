import type { ComponentProps } from "react";

type SelectProps = ComponentProps<"select">;

function Select({ className = "", ...props }: SelectProps) {
  return (
    <div className="relative w-full min-w-0">
      <select
        data-slot="select"
        className={`h-10 w-full min-w-0 appearance-none rounded-md border border-control-border bg-container py-2 ps-3 pe-10 text-base text-primary-foreground transition-colors focus-visible:border-brand-border-focus focus-visible:ring-2 focus-visible:ring-brand-border-focus aria-invalid:border-danger-border-default disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-60 ${className}`.trim()}
        {...props}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 bg-current text-secondary-foreground [mask-image:url('/assets/svgs/chevron-down.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
      />
    </div>
  );
}

export { Select };
export type { SelectProps };
