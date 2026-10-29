import type { Locale } from "@/lib/locales";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import { getIntlLocale } from "@/lib/locales";

type ProjectionHeaderText = {
  portfolio: string;
  unavailable: string;
  headline: string;
  projected: string;
};

type ProjectionHeaderProps = {
  initialPrincipal?: string;
  nominalBalance?: string;
  realBalance?: string;
  realLabel: string;
  durationYears?: number;
  locale: Locale;
  currency: Currency;
  text: ProjectionHeaderText;
};

export function ProjectionHeader({
  initialPrincipal,
  nominalBalance,
  realBalance,
  realLabel,
  durationYears = 25,
  locale,
  currency,
  text,
}: ProjectionHeaderProps) {
  const formatter = getCurrencyFormatter(locale, currency, {
    maximumFractionDigits: 0,
  });
  const formattingLocale = getIntlLocale(locale);
  const duration = new Intl.NumberFormat(formattingLocale, {
    style: "unit",
    unit: "year",
    unitDisplay: "long",
  }).format(durationYears);
  const balance = nominalBalance ? formatter.format(Number(nominalBalance)) : text.unavailable;
  const initial = initialPrincipal ? formatter.format(Number(initialPrincipal)) : text.unavailable;
  const realValue = realBalance ? formatter.format(Number(realBalance)) : text.unavailable;
  return (
    <section
      aria-labelledby="portfolio-value-title"
      className="[container-type:inline-size] border-b border-primary-foreground px-4 py-6 lg:px-3"
    >
      <div>
        <div className="min-w-0">
          <h2
            id="portfolio-value-title"
            className="font-sans text-sm font-semibold leading-5 text-secondary-foreground"
          >
            {text.portfolio}
          </h2>
          <p className="mt-4 max-w-[22ch] font-display text-display font-normal text-balance text-primary-foreground [overflow-wrap:anywhere]">
            {text.headline.replace("{initial}", initial)}{" "}
            <span className="italic text-brand-foreground">{balance}</span>
          </p>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm leading-5 text-secondary-foreground">
            <span>{realLabel}</span>
            <span className="text-lg font-semibold tabular-nums text-primary-foreground">{realValue}</span>
          </p>
          <p className="mt-1 text-sm leading-5 text-secondary-foreground">
            {text.projected.replace("{duration}", duration)}
          </p>
        </div>

      </div>
    </section>
  );
}
