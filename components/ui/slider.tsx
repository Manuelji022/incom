"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ComponentProps } from "react";

export type SliderProps = Omit<ComponentProps<typeof BaseSlider.Root>, "className"> & {
  className?: string;
  thumbLabels?: string[];
  thumbValueTexts?: ((value: number, index: number) => string)[];
  thumbDescriptionId?: string;
};

export function Slider({
  thumbLabels = ["Value"],
  thumbValueTexts,
  thumbDescriptionId,
  className = "",
  orientation = "horizontal",
  ...props
}: SliderProps) {
  const values = Array.isArray(props.value)
    ? props.value
    : Array.isArray(props.defaultValue)
      ? props.defaultValue
      : [typeof props.value === "number" ? props.value : typeof props.defaultValue === "number" ? props.defaultValue : 0];

  return (
    <BaseSlider.Root
      {...props}
      orientation={orientation}
      data-slot="slider"
      className={`group relative flex touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-5 data-[orientation=vertical]:flex-col ${className}`.trim()}
    >
      <BaseSlider.Control data-slot="slider-control" className="relative flex h-11 w-full items-center justify-center rounded-md outline-none transition-shadow focus-within:ring-2 focus-within:ring-brand-border-focus/50 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-11 data-[orientation=vertical]:flex-col group-data-[disabled]:opacity-50">
        <BaseSlider.Track data-slot="slider-track" className="relative h-1 w-full rounded-full bg-border-default data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1">
          <BaseSlider.Indicator data-slot="slider-range" className="absolute rounded-full bg-primary-foreground" />
        </BaseSlider.Track>
        {values.map((_, index) => (
          <BaseSlider.Thumb
            key={index}
            index={index}
            data-slot="slider-thumb"
            aria-describedby={thumbDescriptionId}
            getAriaLabel={() => thumbLabels[index] ?? `Value ${index + 1}`}
            getAriaValueText={thumbValueTexts?.[index] ? (_, value, thumbIndex) => thumbValueTexts[thumbIndex](value, thumbIndex) : undefined}
            className="z-10 size-5 rounded-full border border-border-default bg-container shadow-sm outline-none ring-offset-2 transition-shadow after:absolute after:-inset-2.5 after:content-[''] focus-visible:ring-2 focus-visible:ring-brand-border-focus"
          />
        ))}
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
