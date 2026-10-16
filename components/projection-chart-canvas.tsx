"use client";

import { useMemo } from "react";
import { areaY, defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import type { ProjectionPoint } from "@/types/compound-interest";

type ProjectionChartRow = {
  year: number;
  balance: number;
  invested: number;
  growth: number;
  realBalance: number;
};

import type { Locale } from "@/lib/locales";
type ChartText = {
  years: string;
  aria: string;
  keys: string;
  year: string;
  total: string;
  tipGrowth: string;
  tipInvested: string;
  tipToday: string;
};
type ProjectionChartCanvasProps = {
  points: readonly ProjectionPoint[];
  locale: Locale;
  text: ChartText;
};

function formatTooltip(
  row: ProjectionChartRow,
  text: ChartText,
  euroFull: Intl.NumberFormat,
): string {
  return [
    `${text.year}: ${row.year}`,
    `${text.total}: ${euroFull.format(row.balance)}`,
    `${text.tipGrowth}: ${euroFull.format(row.growth)}`,
    `${text.tipInvested}: ${euroFull.format(row.invested)}`,
    `${text.tipToday}: ${euroFull.format(row.realBalance)}`,
  ].join("\n");
}

export function ProjectionChartCanvas({
  points,
  locale,
  text,
}: ProjectionChartCanvasProps) {
  const currencyLocale = locale === "es" ? "es-ES" : "en-IE";
  const compactEuro = useMemo(
    () =>
      new Intl.NumberFormat(currencyLocale, {
        style: "currency",
        currency: "EUR",
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [currencyLocale],
  );
  const fullEuro = useMemo(
    () =>
      new Intl.NumberFormat(currencyLocale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [currencyLocale],
  );
  const rows = useMemo(
    () =>
      points.map((point) => {
        const initial = Number(point.initial_principal);
        const contributions = Number(point.cumulative_contributions);
        return {
          year: point.year,
          balance: Number(point.nominal_balance),
          invested: initial + contributions,
          growth: Number(point.cumulative_investment_growth),
          realBalance: Number(point.inflation_adjusted_balance),
        };
      }),
    [points],
  );

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          areaY(rows, {
            id: "investment-growth",
            x: "year",
            y1: "invested",
            y2: "balance",
            fill: "var(--brand-subtle)",
            fillOpacity: 0.85,
          }),
          lineY(rows, {
            id: "total-invested",
            x: "year",
            y: "invested",
            stroke: "var(--tertiary-foreground)",
            strokeWidth: 1.75,
          }),
          lineY(rows, {
            id: "today-money",
            x: "year",
            y: "realBalance",
            stroke: "var(--secondary-foreground)",
            strokeWidth: 2,
            strokeDasharray: "5 5",
          }),
          lineY(rows, {
            id: "portfolio-balance",
            x: "year",
            y: "balance",
            stroke: "var(--brand-solid)",
            strokeWidth: 3,
          }),
        ],
        scales: {
          x: {
            scale: scaleLinear,
            domain: [0, rows.at(-1)?.year ?? 1],
            axis: {
              label: text.years,
              ticks: { count: 6, format: (value) => `${value}` },
            },
          },
          y: {
            scale: scaleLinear,
            nice: true,
            grid: { stroke: "var(--border-subtle)", strokeOpacity: 0.8 },
            axis: {
              ticks: { count: 5, format: (value) => compactEuro.format(value) },
            },
          },
        },
        margin: { left: 64, right: 18, top: 14, bottom: 54 },
        theme: {
          foreground: "var(--primary-foreground)",
          muted: "var(--secondary-foreground)",
          grid: "var(--border-subtle)",
          background: "var(--page)",
          palette: ["var(--brand-solid)"],
        },
        focus: "group-x",
        tooltip: {
          use: tooltip,
          formatGroup: (focused) =>
            focused[0] ? formatTooltip(focused[0].datum, text, fullEuro) : "",
          placement: ["top", "right", "left", "bottom"],
        },
      }),
    [rows, text, fullEuro, compactEuro],
  );

  return (
    <Chart
      definition={definition}
      height={330}
      initialWidth={720}
      ariaLabel={text.aria}
      ariaDescription={text.keys}
    />
  );
}
