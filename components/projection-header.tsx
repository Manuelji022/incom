import type { Locale } from "@/lib/locales";

type ProjectionHeaderText = {
  portfolio: string;
  unavailable: string;
  projected: string;
  today: string;
  adjusted: string;
};

type ProjectionHeaderProps = {
  nominalBalance?: string;
  realBalance?: string;
  durationYears?: number;
  inflationPercent?: string;
  locale: Locale;
  text: ProjectionHeaderText;
};

export function ProjectionHeader({
  nominalBalance,
  realBalance,
  durationYears = 25,
  inflationPercent = "2",
  locale,
  text,
}: ProjectionHeaderProps) {
  const formattingLocale = locale === "es" ? "es-ES" : "en-IE";
  const euro = new Intl.NumberFormat(formattingLocale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const duration = new Intl.NumberFormat(formattingLocale, {
    style: "unit",
    unit: "year",
    unitDisplay: "long",
  }).format(durationYears);
  const inflation = new Intl.NumberFormat(formattingLocale, {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(Number(inflationPercent) / 100);

  return (
    <section
      aria-labelledby="portfolio-value-title"
      className="[container-type:inline-size] border-b border-border-subtle px-6 py-8 sm:px-8 sm:py-10"
    >
      <div className="flex flex-row gap-6 lg:gap-10">
        <div className="min-w-0 flex-1">
          <h2
            id="portfolio-value-title"
            className="text-sm font-semibold leading-5 text-primary-foreground"
          >
            {text.portfolio}
          </h2>
          <p className="mt-2 whitespace-normal [overflow-wrap:anywhere] text-[clamp(2rem,7cqi,3.25rem)] leading-tight font-semibold tracking-[-0.055em] tabular-nums text-primary-foreground">
            {nominalBalance
              ? euro.format(Number(nominalBalance))
              : text.unavailable}
          </p>
          <p className="mt-3 text-sm leading-5 text-secondary-foreground">
            {text.projected.replace("{duration}", duration)}
          </p>
        </div>

        <div className="min-w-0 flex-1 border-s border-border-subtle ps-6 @[62rem]:ps-8">
          <p className="text-sm font-semibold leading-5 text-secondary-foreground">
            {text.today}
          </p>
          <p className="mt-2 whitespace-normal [overflow-wrap:anywhere] text-[clamp(2rem,7cqi,3.25rem)] leading-tight font-semibold tracking-[-0.055em] tabular-nums text-secondary-foreground">
            {realBalance ? euro.format(Number(realBalance)) : text.unavailable}
          </p>
          <p className="mt-3 text-sm leading-5 text-secondary-foreground">
            {text.adjusted.replace("{inflation}", inflation)}
          </p>
        </div>
      </div>
    </section>
  );
}
