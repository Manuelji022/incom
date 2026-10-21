import type { Locale } from "@/lib/locales";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import { getIntlLocale } from "@/lib/locales";

type ProjectionHeaderText = {
  portfolio: string;
  unavailable: string;
  projected: string;
};

type ProjectionHeaderProps = {
  nominalBalance?: string;
  realBalance?: string;
  realLabel: string;
  durationYears?: number;
  locale: Locale;
  currency: Currency;
  text: ProjectionHeaderText;
};

export function ProjectionHeader({
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
  const realValue = realBalance ? formatter.format(Number(realBalance)) : text.unavailable;
  return (
    <section
      aria-labelledby="portfolio-value-title"
      className="[container-type:inline-size] border-b border-border-subtle px-4 py-6 lg:px-3"
    >
      <div>
        <div className="min-w-0">
          <h2
            id="portfolio-value-title"
            className="text-sm font-semibold leading-5 text-primary-foreground"
          >
            {text.portfolio}
          </h2>
          <p className={`mt-2 [overflow-wrap:anywhere] leading-[1.08] font-semibold tracking-[-0.06em] tabular-nums text-primary-foreground ${balance.length > 14 ? "text-[clamp(1.25rem,6cqi,3rem)]" : "text-[clamp(1.75rem,10cqi,5.5rem)] lg:text-[clamp(3rem,12cqi,5.5rem)]"}`}>
            {balance}
          </p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm leading-5 text-secondary-foreground">
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
