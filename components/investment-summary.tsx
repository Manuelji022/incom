import type { ProjectionPoint } from "@/types/compound-interest";

type InvestmentSummaryProps = {
  point: ProjectionPoint;
};

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-IE", {
  maximumFractionDigits: 0,
});

export function InvestmentSummary({ point }: InvestmentSummaryProps) {
  const finalValue = Number(point.nominal_balance);
  const metrics = [
    { label: "Initial principal", value: Number(point.initial_principal) },
    { label: "Total contributions", value: Number(point.cumulative_contributions) },
    { label: "Investment growth", value: Number(point.cumulative_investment_growth) },
    { label: "Final value (nominal)", value: finalValue },
  ];

  return (
    <section
      aria-labelledby="investment-summary-title"
      className="border-b border-border-subtle px-5 py-6 sm:px-8 sm:py-8"
    >
      <h2 id="investment-summary-title" className="sr-only">
        Investment summary
      </h2>
      <dl className="grid grid-cols-2 divide-x divide-y divide-border-subtle sm:grid-cols-4 sm:divide-y-0">
        {metrics.map((metric) => {
          const share = finalValue > 0 ? (metric.value / finalValue) * 100 : 0;

          return (
            <div key={metric.label} className="min-w-0 px-3 py-4 first:pl-0 even:pl-5 sm:px-4 sm:py-2 sm:first:pl-0 sm:even:pl-4 [&:nth-child(3)]:pl-0 sm:[&:nth-child(3)]:pl-4">
              <dt className="text-xs leading-5 text-secondary-foreground sm:text-sm">
                {metric.label}
              </dt>
              <dd className="mt-2 whitespace-nowrap text-lg font-semibold tracking-[-0.035em] tabular-nums text-primary-foreground sm:text-xl">
                {euro.format(metric.value)}
              </dd>
              <dd className="mt-1 text-xs leading-5 text-secondary-foreground sm:text-sm">
                {metric.label === "Final value (nominal)"
                  ? "Projected portfolio value"
                  : `${percent.format(share)}% of final value`}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
