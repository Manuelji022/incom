"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import { Button } from "@/components/primitives/button";
import { getTotalInvested } from "@/features/compound-calculator/lib/projection-point-metrics";

import type { Locale } from "@/lib/locales";
type SummaryDictionary = ReturnType<
  typeof import("@/lib/i18n").getDictionary
>["summary"];
type SummaryText = { [Key in keyof SummaryDictionary]: string };
type InvestmentSummaryProps = {
  points: readonly ProjectionPoint[];
  locale: Locale;
  currency: Currency;
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

function MobileYearSummary({
  points,
  formatter,
  text,
}: {
  points: readonly ProjectionPoint[];
  formatter: Intl.NumberFormat;
  text: SummaryText;
}) {
  return (
    <div className="divide-y divide-border-subtle lg:hidden">
      {points.map((point) => {
        const metrics = [
          [text.contributions, getTotalInvested(point)],
          [text.growth, Number(point.cumulative_investment_growth)],
          [text.fees, Number(point.cumulative_fees_paid)],
          [text.real, Number(point.inflation_adjusted_balance)],
        ] as const;
        return (
          <details key={point.year} className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-sm py-2 text-sm [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2 text-secondary-foreground">
                <span aria-hidden="true" className="text-base group-open:rotate-90 rtl:group-open:-rotate-90">›</span>
                {text.year} {point.year}
              </span>
              <span className="min-w-0 text-end font-semibold tabular-nums [overflow-wrap:anywhere]">
                {formatter.format(Number(point.nominal_balance))}
              </span>
            </summary>
            <dl className="space-y-3 rounded-md bg-card p-3 text-xs">
              {metrics.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,45%)] items-baseline gap-3">
                  <dt className="text-secondary-foreground">{label}</dt>
                  <dd className="min-w-0 text-end tabular-nums [overflow-wrap:anywhere]">{formatter.format(value)}</dd>
                </div>
              ))}
            </dl>
          </details>
        );
      })}
    </div>
  );
}

function YearlyProjectionTable({
  points,
  finalYear,
  formatter,
  text,
  tableContainerRef,
  tableOverflows,
}: {
  points: readonly ProjectionPoint[];
  finalYear: number | undefined;
  formatter: Intl.NumberFormat;
  text: SummaryText;
  tableContainerRef: RefObject<HTMLDivElement | null>;
  tableOverflows: boolean;
}) {
  return (
    <>
      {tableOverflows ? <p className="mb-2 text-xs text-secondary-foreground">{text.horizontalScrollHint}</p> : null}
      <div role="region" ref={tableContainerRef} aria-label={text.tableRegionLabel} tabIndex={0} className="overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus">
        <table id="yearly-projection-table" className="w-full min-w-[660px] border-collapse text-start text-xs sm:text-sm">
          <caption className="sr-only">{text.caption}</caption>
          <thead><tr className="border-b border-border-subtle text-xs text-secondary-foreground">
            <th className="w-12 py-2 pe-3 font-medium" scope="col">{text.year}</th>
            <th className="px-3 py-2 text-end font-medium" scope="col">{text.portfolio}</th>
            <th className="px-3 py-2 text-end font-medium" scope="col">{text.contributions}</th>
            <th className="px-3 py-2 text-end font-medium" scope="col">{text.growth}</th>
            <th className="px-3 py-2 text-end font-medium" scope="col">{text.fees}</th>
            <th className="py-2 ps-3 text-end font-medium" scope="col">{text.real}</th>
          </tr></thead>
          <tbody>{points.map((point) => {
            const isFinalYear = point.year === finalYear;
            return (
              <tr key={point.year} className={isFinalYear ? "border-t border-border-subtle bg-card font-semibold" : "border-b border-border-subtle"}>
                <th className="py-3 pe-3 font-medium text-secondary-foreground" scope="row">{point.year}</th>
                <td className="whitespace-nowrap px-4 py-3 text-end font-semibold tabular-nums text-primary-foreground">{formatter.format(Number(point.nominal_balance))}</td>
                <td className="whitespace-nowrap px-3 py-3 text-end tabular-nums text-secondary-foreground">{formatter.format(getTotalInvested(point))}</td>
                <td className="whitespace-nowrap px-3 py-3 text-end tabular-nums text-secondary-foreground">{formatter.format(Number(point.cumulative_investment_growth))}</td>
                <td className="whitespace-nowrap px-3 py-3 text-end tabular-nums text-secondary-foreground">{formatter.format(Number(point.cumulative_fees_paid))}</td>
                <td className="whitespace-nowrap py-3 ps-3 text-end tabular-nums text-secondary-foreground">{formatter.format(Number(point.inflation_adjusted_balance))}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}

export function InvestmentSummary({
  points,
  locale,
  currency,
  text,
}: InvestmentSummaryProps) {
  const formatter = getCurrencyFormatter(locale, currency, {
    maximumFractionDigits: 0,
  });
  const [showTable, setShowTable] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const [tableOverflows, setTableOverflows] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const checkpoints = getCheckpointPoints(points);
  const pageCount = Math.ceil(points.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visiblePoints = showAllYears
    ? points.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
    : checkpoints;
  const firstVisibleYear = visiblePoints[0]?.year;
  const lastVisibleYear = visiblePoints.at(-1)?.year;

  useEffect(() => {
    const container = tableContainerRef.current;
    const table = container?.querySelector("table");
    if (!container || !table) return;

    const updateOverflow = () => {
      setTableOverflows(container.scrollWidth > container.clientWidth);
    };
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(container);
    observer.observe(table);
    return () => observer.disconnect();
  }, [visiblePoints.length]);

  return (
    <section
      aria-labelledby="investment-summary-title"
      className="border-b border-border-subtle px-4 py-6 lg:px-8 lg:py-8"
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
            aria-controls="yearly-projection-data"
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
      <div id="yearly-projection-data">
        <div className="mb-4 lg:hidden">
          <Button size="sm" variant="outline" aria-pressed={showTable} onClick={() => setShowTable((value) => !value)}>
            {showTable ? text.mobileSummaryButton : text.mobileTableButton}
          </Button>
        </div>
        {!showTable ? <MobileYearSummary points={visiblePoints} formatter={formatter} text={text} /> : null}
      <div className={showTable ? "" : "hidden lg:block"}>
        <YearlyProjectionTable points={visiblePoints} finalYear={points.at(-1)?.year} formatter={formatter} text={text} tableContainerRef={tableContainerRef} tableOverflows={tableOverflows} />
      </div>
      </div>
      {showAllYears && pageCount > 1 ? (
        <nav
          aria-label={text.pagination}
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
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
