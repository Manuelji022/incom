import type { ProjectionPoint } from "@/types/compound-interest";
import type { Locale } from "@/lib/locales";

type CompositionDictionary = ReturnType<typeof import("@/lib/i18n").getDictionary>["composition"];
type CompositionText = { [Key in keyof CompositionDictionary]: string };

type PortfolioCompositionProps = {
  point?: ProjectionPoint;
  locale: Locale;
  text: CompositionText;
};

export function PortfolioComposition({ point, locale, text }: PortfolioCompositionProps) {
  if (!point) return null;

  const formattingLocale = locale === "es" ? "es-ES" : "en-IE";
  const euro = new Intl.NumberFormat(formattingLocale, {
    style: "currency",
    currency: "EUR",
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
  const contributions = Number(point.initial_principal) + Number(point.cumulative_contributions);
  const growth = Number(point.cumulative_investment_growth);
  const formattedContributions = euro.format(contributions);
  const formattedGrowth = euro.format(growth);
  const compositionTotal = Math.max(0, contributions) + Math.max(0, growth);
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
      className="border-b border-border-subtle px-3 py-8 sm:px-3 sm:py-8"
    >
      <div>
        <h2
          id="portfolio-composition-title"
          className="text-lg font-semibold leading-6 text-primary-foreground"
        >
          {text.title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-secondary-foreground">
          {text.subtitle.replace("{duration}", duration)}
        </p>
      </div>

      <div
        role="img"
        aria-label={ariaLabel}
        className="mt-6 flex h-4 w-full overflow-hidden rounded-full bg-brand-subtle"
      >
        <span
          aria-hidden="true"
          className="h-full bg-secondary-foreground"
          style={{ width: `${contributionWidth}%` }}
        />
      </div>

      <ul className="mt-4 space-y-3" aria-label={text.listLabel}>
        <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 text-sm leading-5">
          <span className="flex min-w-0 items-center gap-2.5 text-primary-foreground">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-secondary-foreground" />
            {text.contributions}
          </span>
          <span className="tabular-nums text-primary-foreground">{formattedContributions}</span>
          <span className="w-10 text-right tabular-nums text-secondary-foreground">
            {percent.format(contributionShare)}
          </span>
        </li>
        <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 text-sm leading-5">
          <span className="flex min-w-0 items-center gap-2.5 text-primary-foreground">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-brand-subtle" />
            {text.growth}
          </span>
          <span className="tabular-nums text-primary-foreground">{formattedGrowth}</span>
          <span className="w-10 text-right tabular-nums text-secondary-foreground">
            {percent.format(growthShare)}
          </span>
        </li>
      </ul>
    </section>
  );
}
