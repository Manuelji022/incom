export function ProjectionHeader() {
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
            €1,044,000
          </p>
          <p className="mt-3 text-sm leading-5 text-secondary-foreground">
            Projected value in 25 years
          </p>
        </div>

        <div className="min-w-0 sm:border-l sm:border-border-subtle sm:pl-6 lg:pl-8">
          <p className="text-sm font-semibold leading-5 text-secondary-foreground">
            In today’s money
          </p>
          <p className="mt-2 whitespace-nowrap text-[clamp(2rem,4vw,3.25rem)] leading-none font-semibold tracking-[-0.055em] tabular-nums text-secondary-foreground">
            €639,000
          </p>
          <p className="mt-3 text-sm leading-5 text-secondary-foreground">
            Adjusted for 2% annual inflation
          </p>
        </div>
      </div>
    </section>
  );
}
