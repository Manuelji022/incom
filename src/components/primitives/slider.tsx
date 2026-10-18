"use client";

import type { ComponentProps } from "react";

export type SliderProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value: number;
  onValueChange: (value: number) => void;
};

export function Slider({
  className = "",
  onValueChange,
  ...props
}: SliderProps) {
  return (
    <input
      {...props}
      type="range"
      data-slot="slider"
      className={`native-slider h-11 w-full cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-brand-border-focus disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      onChange={(event) => onValueChange(event.currentTarget.valueAsNumber)}
    />
  );
}
