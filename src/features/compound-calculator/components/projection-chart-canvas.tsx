"use client";

import { useMemo } from "react";
import { areaY, defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { dot } from "@tanstack/charts/dot";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { text as textMark } from "@tanstack/charts/text";
import { tooltip } from "@tanstack/charts/tooltip";
import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";
import { getTotalInvested } from "@/features/compound-calculator/lib/projection-point-metrics";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";

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
  balance: string;
  invested: string;
  today: string;
  total: string;
  tipGrowth: string;
  tipInvested: string;
  tipToday: string;
};
type ProjectionChartCanvasProps = {
  points: readonly ProjectionPoint[];
  locale: Locale;
  currency: Currency;
  text: ChartText;
};

const CHART_HEIGHT = 330;
const MARGIN = { left: 78, right: 84, top: 14, bottom: 54 };
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const LABEL_MIN_GAP = 16;
const LABEL_EDGE = 8;

type EndLabel = {
  id: string;
  year: number;
  value: number;
  text: string;
  color: string;
  weight: number;
  radius: number;
  dy: number;
};

function getNiceMax(max: number): number {
  if (!(max > 0)) return 1;
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ??
    10 * magnitude;
  return Math.ceil(max / step) * step;
}

// Returns the vertical shift (px) that moves each label off its dot so labels keep a minimum gap inside the plot.
function spreadLabels(lineYs: readonly number[]): number[] {
  const order = lineYs.map((_, i) => i).sort((a, b) => lineYs[a] - lineYs[b]);
  const placed = order.map((i) => Math.max(lineYs[i], LABEL_EDGE));
  for (let i = 1; i < placed.length; i++) {
    placed[i] = Math.max(placed[i], placed[i - 1] + LABEL_MIN_GAP);
  }
  const limit = PLOT_HEIGHT - LABEL_EDGE;
  const overflow = (placed.at(-1) ?? 0) - limit;
  if (overflow > 0) {
    for (let i = placed.length - 1; i >= 0; i--) {
      placed[i] = Math.min(placed[i] - overflow, limit - (placed.length - 1 - i) * LABEL_MIN_GAP);
    }
    placed[0] = Math.max(placed[0], LABEL_EDGE);
  }
  const shifts = lineYs.map(() => 0);
  order.forEach((index, rank) => {
    shifts[index] = placed[rank] - lineYs[index];
  });
  return shifts;
}

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
  currency,
  text,
}: ProjectionChartCanvasProps) {
  const compactEuro = useMemo(
    () => getCurrencyFormatter(locale, currency, {
      notation: "compact",
      maximumFractionDigits: 1,
    }),
    [locale, currency],
  );
  const fullEuro = useMemo(
    () => getCurrencyFormatter(locale, currency, { maximumFractionDigits: 0 }),
    [locale, currency],
  );
  const rows = useMemo(
    () =>
      points.map((point) => {
        return {
          year: point.year,
          balance: Number(point.nominal_balance),
          invested: getTotalInvested(point),
          growth: Number(point.cumulative_investment_growth),
          realBalance: Number(point.inflation_adjusted_balance),
        };
      }),
    [points],
  );

  const yMax = useMemo(
    () => getNiceMax(Math.max(...rows.flatMap((r) => [r.balance, r.invested, r.realBalance]))),
    [rows],
  );

  const endLabels = useMemo<EndLabel[]>(() => {
    const last = rows.at(-1);
    if (!last) return [];
    const series = [
      { id: "portfolio-balance", value: last.balance, color: "var(--chart-balance)", weight: 700, radius: 5 },
      { id: "today-money", value: last.realBalance, color: "var(--secondary-foreground)", weight: 600, radius: 4 },
      { id: "total-invested", value: last.invested, color: "var(--tertiary-foreground)", weight: 600, radius: 4 },
    ];
    const lineYs = series.map((item) => PLOT_HEIGHT * (1 - item.value / yMax));
    const shifts = spreadLabels(lineYs);
    return series.map((item, index) => ({
      ...item,
      year: last.year,
      text: compactEuro.format(item.value),
      dy: shifts[index] + 4,
    }));
  }, [rows, yMax, compactEuro]);

  const endValuesDescription = useMemo(() => {
    const last = rows.at(-1);
    if (!last) return text.keys;
    return [
      text.keys,
      `${text.year} ${last.year}:`,
      `${text.balance} ${fullEuro.format(last.balance)},`,
      `${text.today} ${fullEuro.format(last.realBalance)},`,
      `${text.invested} ${fullEuro.format(last.invested)}.`,
    ].join(" ");
  }, [rows, text, fullEuro]);

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          areaY(rows, {
            id: "investment-growth",
            x: "year",
            y1: "invested",
            y2: "balance",
            fill: "var(--brand-subtle-hover)",
            fillOpacity: 0.9,
          }),
          lineY(rows, {
            id: "total-invested",
            x: "year",
            y: "invested",
            stroke: "var(--tertiary-foreground)",
            strokeWidth: 2.25,
            strokeDasharray: "2 3",
          }),
          lineY(rows, {
            id: "today-money",
            x: "year",
            y: "realBalance",
            stroke: "var(--secondary-foreground)",
            strokeWidth: 2.5,
            strokeDasharray: "6 5",
          }),
          lineY(rows, {
            id: "portfolio-balance",
            x: "year",
            y: "balance",
            stroke: "var(--chart-balance)",
            strokeWidth: 3.5,
          }),
          ...endLabels.map((label) =>
            dot([label], {
              id: `${label.id}-dot`,
              x: "year",
              y: "value",
              r: label.radius,
              fill: label.color,
              stroke: "var(--card)",
              strokeWidth: 1.5,
            }),
          ),
          textMark(endLabels, {
            id: "end-labels",
            x: "year",
            y: "value",
            text: "text",
            fill: (d) => d.color,
            fontSize: 13,
            fontWeight: 600,
            anchor: "start",
            dx: 10,
            dy: (d) => d.dy,
          }),
        ],
        scales: {
          x: {
            scale: scaleLinear,
            domain: [0, rows.at(-1)?.year ?? 1],
            axis: {
              label: text.years,
              ticks: { count: 6, format: (value) => `${value}` },
              tickLabels: { fontSize: 13, fontWeight: 500 },
            },
          },
          y: {
            scale: scaleLinear,
            domain: [0, yMax],
            grid: { stroke: "var(--border-subtle)", strokeOpacity: 0.8 },
            axis: {
              ticks: { count: 5, format: (value) => compactEuro.format(value) },
              tickLabels: { fontSize: 13, fontWeight: 500 },
            },
          },
        },
        margin: MARGIN,
        theme: {
          foreground: "var(--primary-foreground)",
          muted: "var(--secondary-foreground)",
          grid: "var(--border-subtle)",
          background: "var(--card)",
          palette: ["var(--brand-solid)"],
        },
        focus: "group-x",
        tooltip: {
          use: tooltip,
          formatGroup: (focused) => {
            const row = focused.find((item) => "realBalance" in item.datum);
            return row ? formatTooltip(row.datum as ProjectionChartRow, text, fullEuro) : "";
          },
          placement: ["top", "right", "left", "bottom"],
        },
      }),
    [rows, text, fullEuro, compactEuro, yMax, endLabels],
  );

  return (
    <Chart
      definition={definition}
      height={CHART_HEIGHT}
      initialWidth={720}
      ariaLabel={text.aria}
      ariaDescription={endValuesDescription}
    />
  );
}
