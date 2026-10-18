"use client";

import dynamic from "next/dynamic";
import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";
import type { Currency } from "@/lib/currency";

import type { Locale } from "@/lib/locales";
type ProjectionChartProps = {
  points: readonly ProjectionPoint[];
  locale: Locale;
  currency: Currency;
  text: {
    none: string;
    reload: string;
    title: string;
    scenario: string;
    legend: string;
    growth: string;
    balance: string;
    invested: string;
    today: string;
    years: string;
    aria: string;
    keys: string;
    year: string;
    total: string;
    tipGrowth: string;
    tipInvested: string;
    tipToday: string;
  };
};

const ProjectionChartCanvas = dynamic(
  () =>
    import("@/features/compound-calculator/components/projection-chart-canvas").then(
      (module) => module.ProjectionChartCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-[330px] motion-safe:animate-pulse rounded-md bg-card"
      />
    ),
  },
);

export function ProjectionChart({
  points,
  locale,
  currency,
  text,
}: ProjectionChartProps) {
  if (points.length === 0) {
    return (
      <div role="status" className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-secondary-foreground">
        {text.none}
        <button type="button" className="rounded-sm px-2 py-1 text-brand-foreground underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus" onClick={() => window.location.reload()}>
          {text.reload}
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-border-subtle px-4 py-6 lg:px-3 lg:py-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-primary-foreground">
          {text.title}
        </h2>
        <span className="text-xs text-secondary-foreground">
          {text.scenario}
        </span>
      </div>
      <ProjectionChartCanvas points={points} locale={locale} currency={currency} text={text} />
      <ul
        aria-label={text.legend}
        className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-secondary-foreground"
      >
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-sm bg-brand-subtle"
          />
          {text.growth}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-0.5 w-4 bg-chart-balance" />
          {text.balance}
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="w-4 border-t-2 border-dotted border-tertiary-foreground"
          />
          {text.invested}
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="w-4 border-t border-dashed border-secondary-foreground"
          />
          {text.today}
        </li>
      </ul>
    </div>
  );
}
