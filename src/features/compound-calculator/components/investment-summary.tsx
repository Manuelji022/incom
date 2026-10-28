"use client";

import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
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

function YearlyProjectionTable({
  points,
  finalYear,
  formatter,
  text,
}: {
  points: readonly ProjectionPoint[];
  finalYear: number | undefined;
  formatter: Intl.NumberFormat;
  text: SummaryText;
}) {
  return (
    <>
      <p className="mb-3 text-xs leading-5 text-secondary-foreground">{text.columnHelp}</p>
      <div
        role="region"
        aria-label={text.tableRegionLabel}
        tabIndex={0}
        className="max-h-[32rem] overflow-auto rounded-sm border border-border-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus"
      >
        <table id="yearly-projection-table" className="w-full min-w-[660px] border-collapse text-start text-xs sm:text-sm">
          <caption className="sr-only">{text.caption}</caption>
          <thead className="sticky top-0 z-10 bg-container">
            <tr className="border-b border-border-subtle text-xs text-secondary-foreground">
              <th className="w-12 py-2 ps-3 pe-3 text-start font-medium" scope="col">{text.year}</th>
              <th aria-label={`${text.portfolioShort}, ${text.portfolio}`} title={text.portfolio} className="px-3 py-2 text-end font-medium" scope="col">{text.portfolioShort}</th>
              <th aria-label={`${text.contributionsShort}, ${text.contributions}`} title={text.contributions} className="px-3 py-2 text-end font-medium" scope="col">{text.contributionsShort}</th>
              <th aria-label={`${text.growthShort}, ${text.growth}`} title={text.growth} className="px-3 py-2 text-end font-medium" scope="col">{text.growthShort}</th>
              <th aria-label={`${text.feesShort}, ${text.fees}`} title={text.fees} className="px-3 py-2 text-end font-medium" scope="col">{text.feesShort}</th>
              <th aria-label={`${text.realShort}, ${text.real}`} title={text.real} className="py-2 ps-3 pe-3 text-end font-medium" scope="col">{text.realShort}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => {
              const isFinalYear = point.year === finalYear;
              return (
                <tr key={point.year} className={isFinalYear ? "border-t border-border-subtle bg-card font-semibold" : "border-b border-border-subtle"}>
                  <th className="py-3 ps-3 pe-3 text-start font-medium text-secondary-foreground" scope="row">{point.year}</th>
                  <td className="whitespace-nowrap px-4 py-3 text-end font-semibold tabular-nums text-primary-foreground">{formatter.format(Number(point.nominal_balance))}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end tabular-nums text-secondary-foreground">{formatter.format(getTotalInvested(point))}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end tabular-nums text-secondary-foreground">{formatter.format(Number(point.cumulative_investment_growth))}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-end tabular-nums text-secondary-foreground">{formatter.format(Number(point.cumulative_fees_paid))}</td>
                  <td className="whitespace-nowrap py-3 ps-3 pe-3 text-end tabular-nums text-secondary-foreground">{formatter.format(Number(point.inflation_adjusted_balance))}</td>
                </tr>
              );
            })}
          </tbody>
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
  return (
    <section
      aria-labelledby="investment-summary-title"
      className="border-b border-border-subtle px-4 py-6 lg:px-3 lg:py-8"
    >
      <h2
        id="investment-summary-title"
        className="mb-4 text-base font-semibold text-primary-foreground"
      >
        {text.title}
      </h2>
      <YearlyProjectionTable
        points={points}
        finalYear={points.at(-1)?.year}
        formatter={formatter}
        text={text}
      />
    </section>
  );
}
