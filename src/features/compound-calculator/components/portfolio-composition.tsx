import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";
import type { Locale } from "@/lib/locales";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import { getTotalInvested } from "@/features/compound-calculator/lib/projection-point-metrics";
import { getIntlLocale } from "@/lib/locales";

type CompositionDictionary = ReturnType<typeof import("@/lib/i18n").getDictionary>["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };

type PortfolioCompositionProps = {
  point?: ProjectionPoint;
  locale: Locale;
  currency: Currency;
  text: CompositionText;
};

export function PortfolioComposition({ point, locale, currency, text }: PortfolioCompositionProps) {
  if (!point) return null;

  const formattingLocale = getIntlLocale(locale);
  const formatter = getCurrencyFormatter(locale, currency, {
    maximumFractionDigits: 0,
  });
  const percent = new Intl.NumberFormat(formattingLocale, {
    style: "percent",
    maximumFractionDigits: 0,
  });
  const duration = new Intl.NumberFormat(formattingLocale, {
    style: "unit",
    unit: "year",
    unitDisplay: "long",
  }).format(point.year);
  const total = Number(point.nominal_balance);
  const contributions = getTotalInvested(point);
  const growth = Number(point.cumulative_investment_growth);
  const formattedContributions = formatter.format(contributions);
  const formattedGrowth = formatter.format(growth);
  const compositionTotal = Math.max(0, contributions) + Math.max(0, growth);
  const hasLoss = growth < 0;
  const contributionWidth = compositionTotal > 0
    ? (Math.max(0, contributions) / compositionTotal) * 100
    : 0;
  const contributionShare = total !== 0 ? contributions / total : 0;
  const growthShare = total !== 0 ? growth / total : 0;
  const ariaLabel = text.aria
    .replace("{duration}", duration)
    .replace("{contributions}", formattedContributions)
    .replace("{growth}", formattedGrowth);

  return (
    <section
      aria-labelledby="portfolio-composition-title"
      className="border-b border-border-subtle px-4 py-6 lg:px-3 lg:py-8"
    >
      <div>
        <h2
          id="portfolio-composition-title"
          className="text-base font-semibold leading-6 text-primary-foreground"
        >
          {text.title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-secondary-foreground">
          {text.subtitle.replace("{duration}", duration)}
        </p>
      </div>

      {hasLoss ? (
        <p className="mt-5 text-sm leading-5 text-secondary-foreground" role="img" aria-label={ariaLabel}>
          {formattedContributions} · {formattedGrowth}
        </p>
      ) : (
        <div
          role="img"
          aria-label={ariaLabel}
          className="mt-6 flex h-4 w-full overflow-hidden rounded-full bg-brand-subtle"
        >
          <span aria-hidden="true" className="h-full bg-secondary-foreground" style={{ width: `${contributionWidth}%` }} />
        </div>
      )}

      <ul className="mt-4 space-y-3" aria-label={text.listLabel}>
        <li className="grid min-w-0 grid-cols-1 gap-y-1 text-sm leading-5">
          <span className="flex min-w-0 items-start gap-2.5 text-primary-foreground">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-secondary-foreground" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{text.contributions}</span>
          </span>
          <span className="ms-6 flex flex-wrap gap-x-1 text-xs tabular-nums text-primary-foreground sm:text-sm">
            {formattedContributions} <span className="text-secondary-foreground">({percent.format(contributionShare)})</span>
          </span>
        </li>
        <li className="grid min-w-0 grid-cols-1 gap-y-1 text-sm leading-5">
          <span className="flex min-w-0 items-start gap-2.5 text-primary-foreground">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-brand-subtle" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{text.growth}</span>
          </span>
          <span className="ms-6 flex flex-wrap gap-x-1 text-xs tabular-nums text-primary-foreground sm:text-sm">
            {formattedGrowth} <span className="text-secondary-foreground">({percent.format(growthShare)})</span>
          </span>
        </li>
      </ul>
    </section>
  );
}
