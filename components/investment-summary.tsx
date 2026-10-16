"use client";

import { useState } from "react";
import type { ProjectionPoint } from "@/types/compound-interest";
import { Button } from "@/components/ui/button";

import type { Locale } from "@/lib/locales";
type SummaryDictionary = ReturnType<
  typeof import("@/lib/i18n").getDictionary
>["summary"];
type SummaryText = { [Key in keyof SummaryDictionary]: string };
type InvestmentSummaryProps = {
  points: readonly ProjectionPoint[];
  locale: Locale;
  text: SummaryText;
};

const PAGE_SIZE = 6;

function getCheckpointPoints(points: readonly ProjectionPoint[]) {
  const finalYear = points.at(-1)?.year;
  return points.filter(
    (point) =>
      point.year === 0 || point.year === finalYear || point.year % 5 === 0,
  );
}

export function InvestmentSummary({
  points,
  locale,
  text,
}: InvestmentSummaryProps) {
  const euro = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const [showAllYears, setShowAllYears] = useState(false);
  const [page, setPage] = useState(0);
  const checkpoints = getCheckpointPoints(points);
  const pageCount = Math.ceil(points.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visiblePoints = showAllYears
    ? points.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
    : checkpoints;
  const firstVisibleYear = visiblePoints[0]?.year;
  const lastVisibleYear = visiblePoints.at(-1)?.year;

  return (
    <section
      aria-labelledby="investment-summary-title"
      className="border-b border-border-subtle px-5 py-6 sm:px-8 sm:py-8"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="investment-summary-title"
            className="text-base font-semibold text-primary-foreground"
          >
            {text.title}
          </h2>
          <p
            aria-live="polite"
            className="mt-1 text-xs text-secondary-foreground"
          >
            {showAllYears &&
            firstVisibleYear !== undefined &&
            lastVisibleYear !== undefined
              ? text.years
                  .replace("{from}", String(firstVisibleYear))
                  .replace("{to}", String(lastVisibleYear))
                  .replace("{page}", String(currentPage + 1))
                  .replace("{pages}", String(pageCount))
              : text.milestones
                  .replace("{milestones}", String(checkpoints.length))
                  .replace("{total}", String(points.length))}
          </p>
        </div>
        {checkpoints.length < points.length ? (
          <Button
            aria-controls="yearly-projection-table"
            aria-expanded={showAllYears}
            onClick={() => {
              setShowAllYears((isShowingAll) => !isShowingAll);
              setPage(0);
            }}
            size="sm"
            variant="outline"
          >
            {showAllYears ? text.milestonesButton : text.allButton}
          </Button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table
          id="yearly-projection-table"
          className="w-full min-w-[660px] border-collapse text-left text-xs sm:text-sm"
        >
          <caption className="sr-only">{text.caption}</caption>
          <thead>
            <tr className="border-b border-border-subtle text-xs text-secondary-foreground">
              <th className="w-12 py-2 pr-3 font-medium" scope="col">
                {text.year}
              </th>
              <th className="px-3 py-2 text-right font-medium" scope="col">
                {text.portfolio}
              </th>
              <th className="px-3 py-2 text-right font-medium" scope="col">
                {text.contributions}
              </th>
              <th className="px-3 py-2 text-right font-medium" scope="col">
                {text.growth}
              </th>
              <th className="py-2 pl-3 text-right font-medium" scope="col">
                {text.real}
              </th>
            </tr>
          </thead>
          <tbody>
            {visiblePoints.map((point) => {
              const isFinalYear = point.year === points.at(-1)?.year;
              return (
                <tr
                  key={point.year}
                  className={
                    isFinalYear
                      ? "border-t border-border-subtle bg-card font-semibold"
                      : "border-b border-border-subtle"
                  }
                >
                  <th
                    className="py-3 pr-3 font-medium text-secondary-foreground"
                    scope="row"
                  >
                    {point.year}
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-primary-foreground">
                    {euro.format(Number(point.nominal_balance))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-secondary-foreground">
                    {euro.format(
                      Number(point.initial_principal) +
                        Number(point.cumulative_contributions),
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-secondary-foreground">
                    {euro.format(Number(point.cumulative_investment_growth))}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-3 text-right tabular-nums text-secondary-foreground">
                    {euro.format(Number(point.inflation_adjusted_balance))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showAllYears && pageCount > 1 ? (
        <nav
          aria-label={text.pagination}
          className="mt-4 flex items-center justify-between gap-3"
        >
          <Button
            disabled={currentPage === 0}
            onClick={() =>
              setPage((currentPageIndex) => Math.max(0, currentPageIndex - 1))
            }
            size="sm"
            variant="outline"
          >
            {text.previous}
          </Button>
          <span className="text-xs tabular-nums text-secondary-foreground">
            {text.page
              .replace("{page}", String(currentPage + 1))
              .replace("{pages}", String(pageCount))}
          </span>
          <Button
            disabled={currentPage >= pageCount - 1}
            onClick={() =>
              setPage((currentPageIndex) =>
                Math.min(pageCount - 1, currentPageIndex + 1),
              )
            }
            size="sm"
            variant="outline"
          >
            {text.next}
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
