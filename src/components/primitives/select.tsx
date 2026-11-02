import type { ComponentProps } from "react";

type SelectSize = "default" | "sm";

type SelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: SelectSize;
};

// Height comes from the box, not padding: vertical padding plus line-height
// would overflow a short control and clip the text's descenders.
const sizeClasses: Record<SelectSize, string> = {
  default: "h-10 ps-3 pe-10 text-base",
  // 16px text below lg keeps iOS from zooming the page on focus.
  sm: "h-9 ps-2.5 pe-8 text-base lg:h-8 lg:text-sm",
};

const chevronClasses: Record<SelectSize, string> = {
  default: "end-3",
  sm: "end-2.5",
};

function Select({ className = "", size = "default", ...props }: SelectProps) {
  return (
    <div className="relative w-full min-w-0">
      <select
        data-slot="select"
        data-size={size}
        className={`w-full min-w-0 appearance-none rounded-md border border-control-border bg-container py-0 leading-normal text-primary-foreground transition-colors focus-visible:border-brand-border-focus focus-visible:ring-2 focus-visible:ring-brand-border-focus aria-invalid:border-danger-border-default disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:opacity-60 ${sizeClasses[size]} ${className}`.trim()}
        {...props}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 bg-current text-secondary-foreground [mask-image:url('/assets/svgs/chevron-down.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${chevronClasses[size]}`}
      />
    </div>
  );
}

export { Select };
export type { SelectProps, SelectSize };
