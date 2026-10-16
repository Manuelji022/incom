import type { ProjectionPoint } from "@/types/compound-interest";

type PortfolioCompositionProps = {
  point?: ProjectionPoint;
};

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-IE", {
  style: "percent",
  maximumFractionDigits: 0,
});

export function PortfolioComposition({ point }: PortfolioCompositionProps) {
  if (!point) return null;

  const total = Number(point.nominal_balance);
  const contributions = Number(point.initial_principal) + Number(point.cumulative_contributions);
  const growth = Number(point.cumulative_investment_growth);
  const compositionTotal = Math.max(0, contributions) + Math.max(0, growth);
  const contributionWidth = compositionTotal > 0
    ? (Math.max(0, contributions) / compositionTotal) * 100
    : 0;
  const contributionShare = total !== 0 ? contributions / total : 0;
  const growthShare = total !== 0 ? growth / total : 0;

  return (
    <section
      aria-labelledby="portfolio-composition-title"
      className="border-b border-border-subtle px-5 py-8 sm:px-8 sm:py-10"
    >
      <div>
        <h2
          id="portfolio-composition-title"
          className="text-lg font-semibold leading-6 text-primary-foreground"
        >
          Portfolio composition
        </h2>
        <p className="mt-1 text-sm leading-5 text-secondary-foreground">
          Expected scenario, after {point.year} years
        </p>
      </div>

      <div
        role="img"
        aria-label={`Portfolio sources after ${point.year} years: ${euro.format(contributions)} from contributions and ${euro.format(growth)} from investment growth.`}
        className="mt-6 flex h-4 w-full overflow-hidden rounded-full bg-brand-subtle"
      >
        <span
          aria-hidden="true"
          className="h-full bg-secondary-foreground"
          style={{ width: `${contributionWidth}%` }}
        />
      </div>

      <ul className="mt-4 space-y-3" aria-label="Portfolio sources">
        <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 text-sm leading-5">
          <span className="flex min-w-0 items-center gap-2.5 text-primary-foreground">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-secondary-foreground" />
            Contributions
          </span>
          <span className="tabular-nums text-primary-foreground">{euro.format(contributions)}</span>
          <span className="w-10 text-right tabular-nums text-secondary-foreground">
            {percent.format(contributionShare)}
          </span>
        </li>
        <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 text-sm leading-5">
          <span className="flex min-w-0 items-center gap-2.5 text-primary-foreground">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-brand-subtle" />
            Investment growth
          </span>
          <span className="tabular-nums text-primary-foreground">{euro.format(growth)}</span>
          <span className="w-10 text-right tabular-nums text-secondary-foreground">
            {percent.format(growthShare)}
          </span>
        </li>
      </ul>
    </section>
  );
}
