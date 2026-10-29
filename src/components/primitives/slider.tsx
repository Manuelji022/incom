"use client";

import type { ComponentProps, CSSProperties } from "react";

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
  style,
  ...props
}: SliderProps) {
  const min = Number(props.min ?? 0);
  const max = Number(props.max ?? 100);
  const fill = max > min ? Math.min(100, Math.max(0, ((props.value - min) / (max - min)) * 100)) : 0;
  return (
    <input
      {...props}
      style={{ ...style, "--slider-fill": `${fill}%` } as CSSProperties}
      type="range"
      data-slot="slider"
      className={`native-slider h-11 w-full cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-brand-border-focus disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      onChange={(event) => onValueChange(event.currentTarget.valueAsNumber)}
    />
  );
}
