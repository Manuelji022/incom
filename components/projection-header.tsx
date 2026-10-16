type ProjectionHeaderProps = {
  nominalBalance?: string;
  realBalance?: string;
  durationYears?: number;
  inflationPercent?: string;
};

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency", currency: "EUR", maximumFractionDigits: 0,
});

export function ProjectionHeader({
  nominalBalance,
  realBalance,
  durationYears = 25,
  inflationPercent = "2",
}: ProjectionHeaderProps) {
  return (
    <section
      aria-labelledby="portfolio-value-title"
      className="border-b border-border-subtle px-6 py-8 sm:px-8 sm:py-10"
    >
      <div className="grid gap-8 sm:grid-cols-2 sm:gap-6 lg:gap-10">
        <div className="min-w-0">
          <h2
            id="portfolio-value-title"
            className="text-sm font-semibold leading-5 text-primary-foreground"
          >
            Portfolio value
          </h2>
          <p className="mt-2 whitespace-nowrap text-[clamp(2rem,4vw,3.25rem)] leading-none font-semibold tracking-[-0.055em] tabular-nums text-primary-foreground">
            {nominalBalance ? euro.format(Number(nominalBalance)) : "Unavailable"}
          </p>
          <p className="mt-3 text-sm leading-5 text-secondary-foreground">
            Projected value in {durationYears} years
          </p>
        </div>

        <div className="min-w-0 sm:border-l sm:border-border-subtle sm:pl-6 lg:pl-8">
          <p className="text-sm font-semibold leading-5 text-secondary-foreground">
            In today’s money
          </p>
          <p className="mt-2 whitespace-nowrap text-[clamp(2rem,4vw,3.25rem)] leading-none font-semibold tracking-[-0.055em] tabular-nums text-secondary-foreground">
            {realBalance ? euro.format(Number(realBalance)) : "Unavailable"}
          </p>
          <p className="mt-3 text-sm leading-5 text-secondary-foreground">
            Adjusted for {inflationPercent}% annual inflation
          </p>
        </div>
      </div>
    </section>
  );
}
