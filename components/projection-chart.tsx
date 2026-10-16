"use client";

import dynamic from "next/dynamic";
import type { ProjectionPoint } from "@/types/compound-interest";

type ProjectionChartProps = { points: readonly ProjectionPoint[] };

const ProjectionChartCanvas = dynamic(
  () =>
    import("@/components/projection-chart-canvas").then(
      (module) => module.ProjectionChartCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-[330px] animate-pulse rounded-md bg-card"
      />
    ),
  },
);

export function ProjectionChart({ points }: ProjectionChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-secondary-foreground">
        No annual projection data is available.
      </div>
    );
  }

  return (
    <div className="border-b border-border-subtle px-5 py-6 sm:px-8 sm:py-8">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-primary-foreground">
          Portfolio projection
        </h2>
        <span className="text-xs text-secondary-foreground">
          Expected scenario
        </span>
      </div>
      <ProjectionChartCanvas points={points} />
      <ul
        aria-label="Chart legend"
        className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-secondary-foreground"
      >
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-sm bg-brand-subtle"
          />
          Investment growth
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-0.5 w-4 bg-brand-solid"
          />
          Portfolio balance
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-0.5 w-4 bg-tertiary-foreground"
          />
          Total invested
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="w-4 border-t border-dashed border-secondary-foreground"
          />
          Today’s money
        </li>
      </ul>
    </div>
  );
}
