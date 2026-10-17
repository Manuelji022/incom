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
      className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] border border-border-subtle bg-page"
    >
      {cards.map((card) => (
        <div key={card.label} className="flex min-w-0 flex-col gap-1 px-3 py-4.5">
          <dt className="min-h-5 text-xs leading-normal text-secondary-foreground">{card.label}</dt>
          <dd className="text-[clamp(1rem,5vw,1.25rem)] font-semibold leading-7 tracking-[-0.025em] tabular-nums text-primary-foreground">
            {card.value}
          </dd>
          {card.detail ? (
            <dd className="text-xs leading-normal text-secondary-foreground">
              {card.detail}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
