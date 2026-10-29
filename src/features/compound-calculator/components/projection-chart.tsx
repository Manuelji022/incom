"use client";

import dynamic from "next/dynamic";
import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";
import type { Currency } from "@/lib/currency";

import type { Locale } from "@/lib/locales";
type ProjectionChartProps = {
  points: readonly ProjectionPoint[];
  locale: Locale;
  currency: Currency;
  inset?: "default" | "section";
  text: {
    none: string;
    reload: string;
    title: string;
    scenario: string;
    disclaimer: string;
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
  inset = "default",
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

  const horizontalInset =
    inset === "section"
      ? "px-4 sm:px-6 lg:px-6"
      : "px-4 lg:px-3";

  return (
    <div
      className={`border-b border-border-strong ${horizontalInset} py-6 lg:py-8`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-primary-foreground">
          {text.title}
        </h2>
        <span className="text-xs text-secondary-foreground">
          {text.scenario}
        </span>
      </div>
      <div className="rounded-sm border border-border-subtle bg-card p-2 sm:p-3">
        <ProjectionChartCanvas points={points} locale={locale} currency={currency} text={text} />
      </div>
      <p className="mx-auto mt-4 max-w-2xl text-xs leading-5 text-secondary-foreground">
        {text.disclaimer}
      </p>
    </div>
  );
}
