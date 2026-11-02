"use client";

import { Fragment, useId, useState, type ComponentProps, type ReactNode } from "react";

import { usePresence } from "@/hooks/use-presence";

import { Button } from "@/components/primitives/button";
import { FieldGroup } from "@/components/primitives/field";
import { NumericField } from "@/components/primitives/numeric-field";
import { Select } from "@/components/primitives/select";
import { SegmentedControl } from "@/components/primitives/segmented-control";
import { ProjectionSliderFields, ScenarioRangeField } from "@/features/compound-calculator/components/slider-fields";
import { getCurrencyFormatter, currencies, getCurrencySymbol, isCurrency, type Currency } from "@/lib/currency";
import { normalizeDecimalInput } from "@/features/compound-calculator/lib/decimal-input";
import { getIntlLocale } from "@/lib/locales";
import type {
  ContributionFrequency,
  ContributionTiming,
} from "@/features/compound-calculator/types/compound-interest";

type CompoundInputSidebarProps = Pick<ComponentProps<"aside">, "className"> & {
  text: ReturnType<typeof import("@/lib/i18n").getDictionary>["sidebar"];
  locale: "en" | "es";
  submitting: boolean;
  calculatingLabel: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  initialValues?: Record<string, string>;
  advancedOpen: boolean;
  onToggleAdvanced: () => void;
};

const contributionFrequencies: {
  value: ContributionFrequency;
  label: string;
}[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

const contributionTimings: { value: ContributionTiming; label: string }[] = [
  { value: "beginning", label: "Beginning" },
  { value: "end", label: "End of period" },
];

export function SidebarGroup({
  title,
  as: Heading = "h3",
  className = "",
  action,
  children,
}: {
  title: string;
  as?: "h2" | "h3";
  className?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  const heading = (
    <Heading id={titleId} className="text-xs font-medium uppercase leading-5 tracking-[0.08em] text-secondary-foreground">
      {title}
    </Heading>
  );
  return (
    <section aria-labelledby={titleId} className={className}>
      {action ? <div className="flex min-h-8 items-center justify-between gap-3">{heading}{action}</div> : heading}
      {children}
    </section>
  );
}

export function CompoundInputSidebar({
  className = "",
  text,
  locale,
  submitting,
  calculatingLabel,
  collapsed,
  onToggleCollapsed,
  currency,
  onCurrencyChange,
  initialValues,
  advancedOpen,
  onToggleAdvanced,
}: CompoundInputSidebarProps) {
  const [summaryValues, setSummaryValues] = useState({
    principal: initialValues?.initial_principal ?? "40000",
    recurring: initialValues?.["recurring_contribution.amount"] ?? "1000",
    frequency: initialValues?.["recurring_contribution.frequency"] ?? "monthly",
    years: initialValues?.duration_years ?? "25",
    expectedReturn: initialValues?.expected_annual_return_percent ?? "8",
    fee: initialValues?.annual_fee_percent ?? "0.05",
    inflation: initialValues?.expected_annual_inflation_percent ?? "2",
    range: initialValues?.scenario_range_percentage_points ?? "2",
  });
  const format = getCurrencyFormatter(locale, currency, { maximumFractionDigits: 0 });
  const number = new Intl.NumberFormat(getIntlLocale(locale), { maximumFractionDigits: 2 });
  const parsed = (value: string) => Number(normalizeDecimalInput(value));
  const hasContribution = parsed(summaryValues.recurring) > 0;
  const frequencyLabel = summaryValues.frequency === "annual" ? text.annual : summaryValues.frequency === "quarterly" ? text.quarterly : text.monthly;
  const contributionSummary = parsed(summaryValues.recurring) > 0 ? ` · ${format.format(parsed(summaryValues.recurring))} ${frequencyLabel.toLocaleLowerCase(locale)}` : "";
  const summary = `${format.format(parsed(summaryValues.principal))}${contributionSummary} · ${summaryValues.years} ${text.years} · ${number.format(parsed(summaryValues.expectedReturn))}%`;
  const advancedSummary = [
    `${text.fee} ${number.format(parsed(summaryValues.fee))}%`,
    `${text.inflation} ${number.format(parsed(summaryValues.inflation || "2"))}%`,
    `±${number.format(parsed(summaryValues.range || "2"))} pp`,
  ];
  const { rendered: panelContentRendered, present: panelContentPresent } = usePresence(!collapsed);
  const panelContentClass = `panel-collapse-content ${panelContentPresent ? "" : "panel-collapse-content--hidden"}`.trim();
  const summaryFieldKeys: Record<string, keyof typeof summaryValues> = {
    initial_principal: "principal",
    "recurring_contribution.amount": "recurring",
    "recurring_contribution.frequency": "frequency",
    duration_years: "years",
    "duration-years-slider": "years",
    expected_annual_return_percent: "expectedReturn",
    annual_fee_percent: "fee",
    expected_annual_inflation_percent: "inflation",
    scenario_range_percentage_points: "range",
    "scenario-range-slider": "range",
  };
  return (
    <aside
      aria-labelledby="compound-input-sidebar-title"
      onInput={(event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
        // NumericField's visible input is named "<field>-display" and shows
        // grouping commas; its hidden twin carries the raw value.
        const isDisplay = target.name.endsWith("-display");
        const name = isDisplay ? target.name.slice(0, -"-display".length) : target.name;
        const key = summaryFieldKeys[name] ?? summaryFieldKeys[target.id];
        const value = isDisplay ? target.value.replaceAll(",", "") : target.value;
        if (key) setSummaryValues((values) => ({ ...values, [key]: value }));
      }}
      className={`relative flex min-h-0 w-full shrink-0 flex-col border-e border-border-strong bg-page lg:max-w-[18.25rem] ${collapsed ? "lg:w-10 lg:min-w-10 lg:overflow-visible lg:border-e-0" : ""} ${className}`.trim()}
    >
      <header className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 border-b border-border-subtle px-5 py-4 sm:px-8 ${collapsed ? "lg:min-w-0 lg:border-0 lg:p-0" : ""}`}>
        <h2 id="compound-input-sidebar-title" className={`text-base font-semibold leading-6 text-primary-foreground ${collapsed ? "lg:hidden" : ""}`}>
          {text.title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={collapsed ? text.edit : text.hide}
          aria-expanded={!collapsed}
          aria-controls="compound-input-sidebar-fields"
          onClick={onToggleCollapsed}
          className={`min-h-11 shrink-0 lg:min-h-8 lg:px-2 ${collapsed ? "lg:absolute lg:start-0 lg:top-5 lg:z-20" : ""}`}
        >
          <span className="lg:hidden">{collapsed ? text.edit : text.hide}</span>
          <span aria-hidden="true" className={`panel-collapse-icon size-4 bg-current [mask-image:url('/assets/svgs/panel-left.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${collapsed ? "rotate-180" : ""}`} />
        </Button>
        <p className={`col-span-2 text-sm leading-5 text-secondary-foreground ${collapsed ? "lg:hidden" : ""}`}>
          {collapsed ? summary : text.intro}
        </p>
      </header>

      <fieldset id="compound-input-sidebar-fields" disabled={submitting} inert={collapsed} aria-hidden={collapsed} className={`m-0 flex min-h-0 min-w-0 flex-1 flex-col border-0 p-0 disabled:opacity-100 ${panelContentClass} ${panelContentRendered ? "" : "hidden"}`}>
        <div className="space-y-8 px-5 pt-6 sm:px-8">
          <SidebarGroup
            title={text.startingPoint}
            className="space-y-3"
            action={
              <div className="w-[6.5rem] shrink-0">
                <label htmlFor="display-currency" className="sr-only">{text.currency}</label>
                <Select
                  id="display-currency"
                  value={currency}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (isCurrency(value)) onCurrencyChange(value);
                  }}
                  size="sm"
                >
                  {currencies.map((option) => (
                    <option key={option} value={option}>
                      {option} ({getCurrencySymbol(option)})
                    </option>
                  ))}
                </Select>
              </div>
            }
          >
            <NumericField
              id="initial-principal"
              name="initial_principal"
              label={text.initial}
              unit={getCurrencySymbol(currency)}
              defaultValue={initialValues?.initial_principal ?? "40000"}
              min="0"
              step="0.01"
              required
            />
          </SidebarGroup>

          <SidebarGroup title={text.contributions} className="space-y-3">
            <FieldGroup className="gap-5">
              <NumericField
                id="recurring-contribution-amount"
                name="recurring_contribution.amount"
                label={text.recurring}
                unit={getCurrencySymbol(currency)}
                defaultValue={initialValues?.["recurring_contribution.amount"] ?? "1000"}
                min="0"
                step="0.01"
                description={hasContribution ? undefined : text.blank}
                optional
                optionalLabel={text.optional}
              />
              {hasContribution ? (
                <SegmentedControl
                  label={text.frequency}
                  name="recurring_contribution.frequency"
                  defaultValue={initialValues?.["recurring_contribution.frequency"] ?? "monthly"}
                  options={contributionFrequencies.map((option) => ({
                    ...option,
                    label:
                      option.value === "monthly"
                        ? text.monthly
                        : option.value === "quarterly"
                          ? text.quarterly
                          : text.annual,
                  }))}
                />
              ) : null}
            </FieldGroup>
          </SidebarGroup>

          <SidebarGroup title={text.assumptions} className="space-y-3">
            <FieldGroup className="gap-5">
              <ProjectionSliderFields text={text} locale={locale} initialValues={initialValues} />
            </FieldGroup>
          </SidebarGroup>

          <section className="-mx-5 border-t border-border-subtle sm:-mx-8">
            <button
              type="button"
              aria-expanded={advancedOpen}
              aria-controls="advanced-assumption-fields"
              onClick={onToggleAdvanced}
              className="group/disclosure flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-start text-sm font-medium text-primary-foreground sm:px-8"
            >
              <span>{advancedOpen ? text.closeAssumptions : text.openAssumptions}</span>
              <span
                aria-hidden="true"
                className={`panel-collapse-icon size-4 shrink-0 bg-current text-secondary-foreground group-hover/disclosure:text-primary-foreground [mask-image:url('/assets/svgs/chevron-down.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${advancedOpen ? "rotate-180" : ""}`}
              />
            </button>
            <p className={`-mt-2 px-5 pb-4 text-xs leading-5 text-secondary-foreground tabular-nums sm:px-8 ${advancedOpen ? "sr-only" : ""}`}>
              {advancedSummary.map((item, index) => (
                <Fragment key={item}>
                  {index > 0 ? " · " : null}
                  <span className="whitespace-nowrap">{item}</span>
                </Fragment>
              ))}
            </p>
            <div id="advanced-assumption-fields" hidden={!advancedOpen} className="px-5 pb-6 pt-2 sm:px-8">
              <FieldGroup className="gap-5">
                <NumericField
                  id="annual-fee"
                  name="annual_fee_percent"
                  label={text.fee}
                  unit="%"
                  defaultValue={initialValues?.annual_fee_percent ?? "0.05"}
                  min="0"
                  step="0.01"
                  description={text.feeDescription}
                  optional
                  optionalLabel={text.optional}
                />
                <NumericField
                  id="expected-inflation"
                  name="expected_annual_inflation_percent"
                  label={text.inflation}
                  unit="%"
                  defaultValue={initialValues?.expected_annual_inflation_percent ?? "2"}
                  step="0.1"
                  optional
                  optionalLabel={text.optional}
                />
                <ScenarioRangeField
                  id="scenario-range"
                  name="scenario_range_percentage_points"
                  label={text.range}
                  expectedReturn={parsed(summaryValues.expectedReturn)}
                  text={text}
                  locale={locale}
                  initialValues={initialValues}
                />
                {hasContribution ? (
                  <>
                    <SegmentedControl
                      label={text.timing}
                      name="recurring_contribution.timing"
                      defaultValue={initialValues?.["recurring_contribution.timing"] ?? "beginning"}
                      options={contributionTimings.map((option) => ({
                        ...option,
                        label: option.value === "beginning" ? text.beginning : text.end,
                      }))}
                    />
                    <NumericField
                      id="contribution-increase"
                      name="recurring_contribution.annual_increase_percent"
                      label={text.increase}
                      unit="%"
                      defaultValue={initialValues?.["recurring_contribution.annual_increase_percent"] ?? "2"}
                      min="0"
                      step="0.1"
                      optional
                      optionalLabel={text.optional}
                    />
                  </>
                ) : null}
              </FieldGroup>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 z-10 mt-auto border-t border-border-subtle bg-page px-5 py-4 sm:px-8">
          <Button type="submit" disabled={submitting || collapsed} className="min-h-12 w-full lg:min-h-10">
            {submitting ? <><span aria-hidden="true" className="me-2 inline-block size-3 motion-safe:animate-spin rounded-full border-2 border-current border-e-transparent" />{text.calculate}<span className="sr-only"> {calculatingLabel}</span></> : text.calculate}
          </Button>
        </div>
      </fieldset>
    </aside>
  );
}
