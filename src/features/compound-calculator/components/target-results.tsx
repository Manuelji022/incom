"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/button";
import { ProjectionChart } from "@/features/compound-calculator/components/projection-chart";
import { getCurrencyFormatter, type Currency } from "@/lib/currency";
import type { getDictionary } from "@/lib/i18n";
import type { getTargetText } from "@/features/compound-calculator/lib/target-i18n";
import type { Locale } from "@/lib/locales";
import type { TargetResponse } from "@/features/compound-calculator/types/compound-interest-target";

type Props = { result: TargetResponse; locale: Locale; currency: Currency; text: ReturnType<typeof getDictionary>; targetText: ReturnType<typeof getTargetText> };
export function TargetResults({ result, locale, currency, text, targetText: t }: Props) {
  const [selected, setSelected] = useState("expected");
  const scenario = result.scenarios.find((item) => item.name === selected) ?? result.scenarios[1];
  const inputs = result.resolved_inputs;
  const format = getCurrencyFormatter(locale, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Intl accepts decimal strings at runtime, avoiding a float round-trip for display.
  const money = (value: string) => format.format(value as unknown as number);
  const plan = inputs.contribution_plan;
  const period = plan.frequency === "monthly" ? t.perMonth : plan.frequency === "quarterly" ? t.perQuarter : t.perYear;
  const summaryMetrics = [
    [t.nominalBalance, scenario.final_summary.nominal_balance],
    [t.realBalance, scenario.final_summary.inflation_adjusted_balance],
    [text.summary.totalFeesPaid, scenario.final_summary.cumulative_fees_paid],
    [
      text.summary.investmentGrowth,
      scenario.final_summary.cumulative_investment_growth,
    ],
  ] as const;
  const assumptions: { label: string; value: string; source: "caller" | "server_default"; suffix: string }[] = [
    { label: text.sidebar.fee, ...inputs.annual_fee_percent, suffix: "%" },
    { label: text.sidebar.inflation, ...inputs.expected_annual_inflation_percent, suffix: "%" },
    { label: text.sidebar.range, ...inputs.scenario_range_percentage_points, suffix: "%" },
    { label: text.sidebar.timing, ...inputs.contribution_plan.timing, suffix: "" },
    { label: text.sidebar.increase, ...inputs.contribution_plan.annual_increase_percent, suffix: "%" },
  ];
  return <>
    <section aria-labelledby="target-contributions-title" className="space-y-4 border-b border-border-subtle p-4 sm:p-6">
      <h2 id="target-contributions-title" className="text-lg font-semibold">{t.contribution}</h2>
      <dl className="text-sm"><dt className="text-secondary-foreground">{t.nominalTarget}</dt><dd className="font-medium tabular-nums text-primary-foreground">{money(inputs.nominal_target_amount)}</dd></dl>
      <div className="grid gap-3 sm:grid-cols-3">
        {result.scenarios.map((item) => <Button key={item.name} type="button" variant="outline" aria-pressed={scenario.name === item.name} onClick={() => setSelected(item.name)} className="h-auto min-w-0 flex-col items-stretch gap-2 p-4 text-start aria-pressed:border-brand-border-focus aria-pressed:bg-brand-subtle">
          <span className="font-semibold">{text.scenarios[item.name]} · {item.annual_return_percent}%</span>
          <span className="flex w-full min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="min-w-0 text-2xl font-semibold tabular-nums">{money(item.required_contribution_amount)}</span>
            <span className="font-normal text-secondary-foreground">{period}</span>
          </span>
        </Button>)}
      </div>
      {Number(scenario.required_contribution_amount) === 0 ? <p className="rounded-md bg-container p-3 text-sm">{t.zero}</p> : null}
      <dl className="grid lg:grid-cols-4">
        {summaryMetrics.map(([label, value]) => (
          <div
            key={label}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,45%)] items-baseline gap-x-4 gap-y-1 py-3 lg:flex lg:flex-col lg:gap-0 lg:px-3"
          >
            <dt className="min-h-5 text-xs leading-normal text-secondary-foreground lg:grid lg:min-h-[2lh] lg:content-end">
              {label}
            </dt>
            <dd className="min-w-0 text-end [overflow-wrap:anywhere] text-base font-semibold leading-7 tracking-[-0.025em] tabular-nums text-primary-foreground lg:text-start lg:text-[clamp(1rem,5vw,1.25rem)]">
              {money(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
    <ProjectionChart points={scenario.annual_points} locale={locale} currency={currency} inset="section" text={{ ...text.chart, scenario: text.chart.scenario.replace("{scenario}", text.scenarios[scenario.name]), aria: text.chart.aria.replace("{scenario}", text.scenarios[scenario.name]) }} />
    <section aria-labelledby="target-schedule-title" className="space-y-3 border-b border-border-subtle p-4 sm:p-6">
      <h2 id="target-schedule-title" className="text-lg font-semibold">{t.schedule} · {text.scenarios[scenario.name]}</h2>
      <p className="text-sm text-secondary-foreground">{t.scheduleHelp}</p>
      <p className="text-sm text-secondary-foreground">{t.scheduleScrollHelp}</p>
      <div tabIndex={0} role="region" aria-labelledby="target-schedule-title" className="max-h-[32rem] overflow-auto rounded-md border border-border-subtle focus-visible:outline-2 focus-visible:outline-brand-border-focus">
        <table className="w-full min-w-[54rem] text-start text-sm tabular-nums">
          <caption className="sr-only">{t.schedule} · {text.scenarios[scenario.name]} · {period}</caption>
          <thead className="sticky top-0 bg-container text-secondary-foreground"><tr>
            {[text.summary.year, t.annualContributions, t.cumulativeContributions, t.nominalBalance, t.realBalance, t.annualFees].map((label) => <th key={label} scope="col" className="px-4 py-3 text-start font-medium">{label}</th>)}
          </tr></thead>
          <tbody>{scenario.annual_points.map((point) => <tr key={point.year} className="border-t border-border-subtle">
            <th scope="row" className="px-4 py-3 text-start font-medium">{point.year}</th>
            {[point.contributions_during_year, point.cumulative_contributions, point.nominal_balance, point.inflation_adjusted_balance, point.fees_during_year].map((value, index) => <td key={index} className="whitespace-nowrap px-4 py-3">{money(value)}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
    </section>
    <section aria-labelledby="target-disclosures-title" className="space-y-2 p-4 text-sm text-secondary-foreground sm:p-6">
      <h2 id="target-disclosures-title" className="font-semibold text-primary-foreground">{t.disclosures}</h2>
      <p>{t.caveat}</p>
      <ul className="list-disc space-y-1 ps-5">
        <li>{t.taxes}</li>
        <li>{t.fees}</li>
        <li>{t.constant}</li>
      </ul>
    </section>
    <section aria-labelledby="target-assumptions-title" className="space-y-3 border-t border-border-subtle p-4 text-sm sm:p-6">
      <h2 id="target-assumptions-title" className="font-semibold">{t.assumptions}</h2>
      <dl className="grid gap-2 sm:grid-cols-2">
        {assumptions.map(({ label, value, source, suffix }) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-secondary-foreground">{label}</dt>
            <dd className="text-end">{value}{suffix} · {source === "server_default" ? t.defaultSource : t.callerSource}</dd>
          </div>
        ))}
      </dl>
    </section>
  </>;
}
