import type { Locale } from "@/lib/locales";
import type { ProjectionPoint } from "@/types/compound-interest";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";

type SummaryText = {
  cardsLabel: string;
  initialPrincipal: string;
  totalContributions: string;
  investmentGrowth: string;
  totalFeesPaid: string;
  feesPaidDescription: string;
  finalValue: string;
  shareOfFinalValue: string;
  realTerms: string;
};

type InvestmentSummaryCardsProps = {
  point: ProjectionPoint | undefined;
  cumulativeFeesPaid: string;
  locale: Locale;
  currency: Currency;
  text: SummaryText;
};

export function InvestmentSummaryCards({ point, cumulativeFeesPaid, locale, currency, text }: InvestmentSummaryCardsProps) {
  if (!point) return null;

  const formatter = getCurrencyFormatter(locale, currency, {
    maximumFractionDigits: 0,
  });
  const percent = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", {
    style: "percent",
    maximumFractionDigits: 0,
  });
  const finalValue = Number(point.nominal_balance);
  const formatShare = (value: number) =>
    text.shareOfFinalValue.replace(
      "{percent}",
      percent.format(finalValue === 0 ? 0 : value / finalValue),
    );
  const cards = [
    {
      label: text.initialPrincipal,
      value: formatter.format(Number(point.initial_principal)),
      detail: formatShare(Number(point.initial_principal)),
    },
    {
      label: text.totalContributions,
      value: formatter.format(Number(point.initial_principal) + Number(point.cumulative_contributions)),
      detail: formatShare(Number(point.initial_principal) + Number(point.cumulative_contributions)),
    },
    {
      label: text.investmentGrowth,
      value: formatter.format(Number(point.cumulative_investment_growth)),
      detail: formatShare(Number(point.cumulative_investment_growth)),
    },
    {
      label: text.totalFeesPaid,
      value: formatter.format(Number(cumulativeFeesPaid)),
    },
    {
      label: text.finalValue,
      value: formatter.format(Number(point.inflation_adjusted_balance)),
    },
  ];

  return (
    <dl
      aria-label={text.cardsLabel}
      className="grid border-b border-border-subtle bg-page px-4 py-2 lg:grid-cols-5 lg:border lg:p-0"
    >
      {cards.map((card) => (
        <div key={card.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,45%)] items-baseline gap-x-4 gap-y-1 py-3 lg:flex lg:flex-col lg:gap-1 lg:px-3 lg:py-4.5">
          <dt className="min-h-5 text-xs leading-normal text-secondary-foreground">{card.label}</dt>
          <dd className="min-w-0 text-end [overflow-wrap:anywhere] lg:text-start text-base lg:text-[clamp(1rem,5vw,1.25rem)] font-semibold leading-7 tracking-[-0.025em] tabular-nums text-primary-foreground">
            {card.value}
          </dd>
          {card.detail ? (
            <dd className="col-span-2 text-xs leading-normal text-secondary-foreground">
              {card.detail}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
