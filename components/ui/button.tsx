import type { ComponentProps } from "react";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-brand-solid text-on-brand-solid-foreground hover:bg-brand-solid-hover active:bg-brand-solid-active",
  outline:
    "border border-border-default bg-container text-primary-foreground hover:bg-component-hover active:bg-component-active",
  secondary:
    "bg-component text-primary-foreground hover:bg-component-hover active:bg-component-active",
  ghost:
    "bg-transparent text-primary-foreground hover:bg-transparent-hover active:bg-transparent-active",
  destructive:
    "bg-danger-solid text-on-danger-solid-foreground hover:bg-danger-solid-hover active:bg-danger-solid-active",
  link: "bg-transparent text-brand-foreground underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "min-h-10 gap-2 rounded-md px-4 py-2 text-sm font-medium",
  xs: "min-h-7 gap-1 rounded-sm px-2 py-1 text-xs font-medium",
  sm: "min-h-8 gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
  lg: "min-h-12 gap-2 rounded-lg px-6 py-3 text-base font-medium",
  icon: "size-10 rounded-md",
  "icon-xs": "size-7 rounded-sm",
  "icon-sm": "size-8 rounded-md",
  "icon-lg": "size-12 rounded-lg",
};

function buttonVariants({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return [
    "group/button inline-flex min-w-0 shrink-0 items-center justify-center whitespace-normal border border-transparent transition-colors",
    "focus-visible:ring-2 focus-visible:ring-brand-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={buttonVariants({ variant, size, className })}
      type={type}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps, ButtonSize, ButtonVariant };
