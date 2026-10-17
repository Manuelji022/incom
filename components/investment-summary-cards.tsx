import type { Locale } from "@/lib/locales";
import type { ProjectionPoint } from "@/types/compound-interest";

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
  text: SummaryText;
};

export function InvestmentSummaryCards({ point, cumulativeFeesPaid, locale, text }: InvestmentSummaryCardsProps) {
  if (!point) return null;

  const euro = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", {
    style: "currency",
    currency: "EUR",
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
      value: euro.format(Number(point.initial_principal)),
      detail: formatShare(Number(point.initial_principal)),
    },
    {
      label: text.totalContributions,
      value: euro.format(Number(point.initial_principal) + Number(point.cumulative_contributions)),
      detail: formatShare(Number(point.initial_principal) + Number(point.cumulative_contributions)),
    },
    {
      label: text.investmentGrowth,
      value: euro.format(Number(point.cumulative_investment_growth)),
      detail: formatShare(Number(point.cumulative_investment_growth)),
    },
    {
      label: text.totalFeesPaid,
      value: euro.format(Number(cumulativeFeesPaid)),
    },
    {
      label: text.finalValue,
      value: euro.format(Number(point.inflation_adjusted_balance)),
    },
  ];

  return (
    <dl
      aria-label={text.cardsLabel}
      className="grid grid-cols-2 border border-border-subtle bg-page sm:grid-cols-5"
    >
      {cards.map((card) => (
        <div key={card.label} className="flex min-w-0 flex-col gap-1 px-3 py-4.5">
          <dt className="min-h-5 text-xs leading-[18px] text-secondary-foreground">{card.label}</dt>
          <dd className="[overflow-wrap:anywhere] text-xl font-semibold leading-7 tracking-[-0.025em] tabular-nums text-primary-foreground">
            {card.value}
          </dd>
          {card.detail ? (
            <dd className="[overflow-wrap:anywhere] text-xs leading-[17px] text-secondary-foreground">
              {card.detail}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
