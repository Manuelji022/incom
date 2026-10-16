"use client";

import { useState } from "react";
import type { ProjectionPoint } from "@/types/compound-interest";
import { Button } from "@/components/ui/button";

type InvestmentSummaryProps = {
  points: readonly ProjectionPoint[];
};

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const PAGE_SIZE = 6;

function getCheckpointPoints(points: readonly ProjectionPoint[]) {
  const finalYear = points.at(-1)?.year;
  return points.filter(
    (point) => point.year === 0 || point.year === finalYear || point.year % 5 === 0,
  );
}

export function InvestmentSummary({ points }: InvestmentSummaryProps) {
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
          <h2 id="investment-summary-title" className="text-base font-semibold text-primary-foreground">
            Yearly projection (expected scenario)
          </h2>
          <p aria-live="polite" className="mt-1 text-xs text-secondary-foreground">
            {showAllYears && firstVisibleYear !== undefined && lastVisibleYear !== undefined
              ? `Years ${firstVisibleYear}–${lastVisibleYear} · page ${currentPage + 1} of ${pageCount}`
              : `${checkpoints.length} milestone years · ${points.length} annual results`}
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
            {showAllYears ? "Show milestone years" : "Show all years"}
          </Button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table id="yearly-projection-table" className="w-full min-w-[660px] border-collapse text-left text-xs sm:text-sm">
          <caption className="sr-only">
            Yearly expected-scenario portfolio value, cumulative contributions,
            investment growth, and inflation-adjusted value.
          </caption>
          <thead>
            <tr className="border-b border-border-subtle text-xs text-secondary-foreground">
              <th className="w-12 py-2 pr-3 font-medium" scope="col">Year</th>
              <th className="px-3 py-2 text-right font-medium" scope="col">Portfolio value</th>
              <th className="px-3 py-2 text-right font-medium" scope="col">Contributions (cumulative)</th>
              <th className="px-3 py-2 text-right font-medium" scope="col">Investment growth</th>
              <th className="py-2 pl-3 text-right font-medium" scope="col">Real value (today’s money)</th>
            </tr>
          </thead>
          <tbody>
            {visiblePoints.map((point) => {
              const isFinalYear = point.year === points.at(-1)?.year;
              return (
                <tr
                  key={point.year}
                  className={isFinalYear ? "border-t border-border-subtle bg-card font-semibold" : "border-b border-border-subtle"}
                >
                  <th className="py-3 pr-3 font-medium text-secondary-foreground" scope="row">
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
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-secondary-foreground">{euro.format(Number(point.cumulative_investment_growth))}</td>
                  <td className="whitespace-nowrap py-3 pl-3 text-right tabular-nums text-secondary-foreground">{euro.format(Number(point.inflation_adjusted_balance))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showAllYears && pageCount > 1 ? (
        <nav
          aria-label="Yearly projection pagination"
          className="mt-4 flex items-center justify-between gap-3"
        >
          <Button
            disabled={currentPage === 0}
            onClick={() => setPage((currentPageIndex) => Math.max(0, currentPageIndex - 1))}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-xs tabular-nums text-secondary-foreground">
            Page {currentPage + 1} of {pageCount}
          </span>
          <Button
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((currentPageIndex) => Math.min(pageCount - 1, currentPageIndex + 1))}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
