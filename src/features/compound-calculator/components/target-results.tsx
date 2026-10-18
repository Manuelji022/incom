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
  const source = (value: { value: string; source: string }, unit = "%") => `${value.value}${unit} (${value.source === "server_default" ? t.defaultSource : t.callerSource})`;
  const assumptions = [
    [t.target, money(inputs.target_amount)],
    [t.basis, inputs.target_basis === "real" ? t.real : t.nominal],
    [t.nominalTarget, money(inputs.nominal_target_amount)],
    [text.sidebar.initial, money(inputs.initial_principal)],
    [text.sidebar.horizon, `${inputs.duration_years} ${text.sidebar.years}`],
    [text.sidebar.return, `${inputs.expected_annual_return_percent}%`],
    [text.sidebar.frequency, text.sidebar[plan.frequency]],
    [text.sidebar.timing, `${plan.timing.value === "beginning" ? text.sidebar.beginning : text.sidebar.end} (${plan.timing.source === "server_default" ? t.defaultSource : t.callerSource})`],
    [text.sidebar.increase, source(plan.annual_increase_percent)],
    [text.sidebar.fee, source(inputs.annual_fee_percent)],
    [text.sidebar.inflation, source(inputs.expected_annual_inflation_percent)],
    [text.sidebar.range, source(inputs.scenario_range_percentage_points, " pp")],
  ];
  const disclosures: Record<string, string> = { PROJECTION_NOT_GUARANTEE: t.caveat, TAXES_EXCLUDED: t.taxes, FEES_MODELED: t.fees, RETURNS_ASSUMED_CONSTANT: t.constant };
  return <>
    <section aria-labelledby="target-contributions-title" className="space-y-4 border-b border-border-subtle p-4 sm:p-6">
      <h2 id="target-contributions-title" className="text-lg font-semibold">{t.contribution}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {result.scenarios.map((item) => <Button key={item.name} type="button" variant="outline" aria-pressed={scenario.name === item.name} onClick={() => setSelected(item.name)} className="h-auto min-w-0 flex-col items-start gap-2 p-4 text-start aria-pressed:border-brand-border-focus aria-pressed:bg-brand-subtle">
          <span className="font-semibold">{text.scenarios[item.name]} · {item.annual_return_percent}%</span>
          <span className="break-all text-2xl font-semibold tabular-nums">{money(item.required_contribution_amount)}</span>
          <span className="font-normal text-secondary-foreground">{period}</span>
        </Button>)}
      </div>
      {Number(scenario.required_contribution_amount) === 0 ? <p className="rounded-md bg-container p-3 text-sm">{t.zero}</p> : null}
      <dl className="grid gap-4 sm:grid-cols-2">
        {[[t.nominalBalance, scenario.final_summary.nominal_balance], [t.realBalance, scenario.final_summary.inflation_adjusted_balance], [text.summary.totalFeesPaid, scenario.final_summary.cumulative_fees_paid], [text.summary.investmentGrowth, scenario.final_summary.cumulative_investment_growth]].map(([label, value]) => <div key={label}>
          <dt className="text-sm text-secondary-foreground">{label}</dt><dd className="mt-1 break-all text-xl font-semibold tabular-nums">{money(value)}</dd>
        </div>)}
      </dl>
    </section>
    <ProjectionChart points={scenario.annual_points} locale={locale} currency={currency} text={{ ...text.chart, scenario: text.chart.scenario.replace("{scenario}", text.scenarios[scenario.name]), aria: text.chart.aria.replace("{scenario}", text.scenarios[scenario.name]) }} />
    <section aria-labelledby="target-schedule-title" className="space-y-3 border-b border-border-subtle p-4 sm:p-6">
      <h2 id="target-schedule-title" className="text-lg font-semibold">{t.schedule} · {text.scenarios[scenario.name]}</h2>
      <p className="text-sm text-secondary-foreground">{t.scheduleHelp}</p>
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
    <section aria-labelledby="target-assumptions-title" className="space-y-4 border-b border-border-subtle p-4 sm:p-6">
      <h2 id="target-assumptions-title" className="text-lg font-semibold">{t.assumptions}</h2>
      <p className="text-sm text-secondary-foreground">{inputs.target_basis === "real" ? t.basisHelp : t.nominalHelp}</p>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{assumptions.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-secondary-foreground">{label}</dt><dd className="break-words text-sm font-medium">{value}</dd></div>)}</dl>
    </section>
    <section aria-labelledby="target-disclosures-title" className="space-y-3 p-4 sm:p-6">
      <h2 id="target-disclosures-title" className="text-base font-semibold">{t.disclosures}</h2>
      <p className="text-sm font-medium">{t.caveat}</p>
      <ul className="list-disc space-y-1 ps-5 text-sm text-secondary-foreground">{result.disclosures.filter((code) => code !== "PROJECTION_NOT_GUARANTEE").map((code) => <li key={code}>{disclosures[code] ?? code}</li>)}</ul>
      <p className="text-xs text-secondary-foreground">{t.calculated}: <time dateTime={result.metadata.calculated_at}>{result.metadata.calculated_at}</time></p>
    </section>
  </>;
}
