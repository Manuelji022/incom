import type { Locale } from "@/lib/locales";
import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import { getTotalInvested } from "@/features/compound-calculator/lib/projection-point-metrics";
import { getIntlLocale } from "@/lib/locales";

type SummaryText = {
  cardsLabel: string;
  initialPrincipal: string;
  totalContributions: string;
  investmentGrowth: string;
  totalFeesPaid: string;
  shareOfFinalValue: string;
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
  const percent = new Intl.NumberFormat(getIntlLocale(locale), {
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
      value: formatter.format(getTotalInvested(point)),
      detail: formatShare(getTotalInvested(point)),
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
  ];

  return (
    <dl
      aria-label={text.cardsLabel}
      className="grid grid-cols-1 gap-px border-y border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <div key={card.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,50%)] items-baseline gap-x-3 gap-y-0 bg-page px-4 py-3 sm:flex sm:flex-col sm:items-start sm:gap-0 lg:px-3 lg:py-3">
          <dt className="min-w-0 text-xs leading-normal text-secondary-foreground">{card.label}</dt>
          <dd className="min-w-0 text-end [overflow-wrap:anywhere] text-base font-semibold leading-7 tracking-[-0.025em] tabular-nums text-primary-foreground sm:text-start lg:text-lg">
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
