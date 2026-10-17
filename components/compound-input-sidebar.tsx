"use client";

import { useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { NumericField } from "@/components/ui/numeric-field";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProjectionSliderFields, ScenarioRangeField } from "@/components/slider-fields";
import { getCurrencyFormatter, currencies, getCurrencySymbol, isCurrency, type Currency } from "@/lib/currency";
import { normalizeDecimalInput } from "@/lib/decimal-input";
import type {
  ContributionFrequency,
  ContributionTiming,
} from "@/types/compound-interest";

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
  const [recurringAmount, setRecurringAmount] = useState(initialValues?.["recurring_contribution.amount"] ?? "1000");
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
  const number = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", { maximumFractionDigits: 2 });
  const parsed = (value: string) => Number(normalizeDecimalInput(value));
  const frequencyLabel = summaryValues.frequency === "annual" ? text.annual : summaryValues.frequency === "quarterly" ? text.quarterly : text.monthly;
  const contributionSummary = parsed(summaryValues.recurring) > 0 ? ` · ${format.format(parsed(summaryValues.recurring))} ${frequencyLabel.toLocaleLowerCase(locale)}` : "";
  const summary = `${format.format(parsed(summaryValues.principal))}${contributionSummary} · ${summaryValues.years} ${text.years} · ${number.format(parsed(summaryValues.expectedReturn))}%`;
  const advancedSummary = `${text.fee} ${number.format(parsed(summaryValues.fee))}% · ${text.inflation} ${number.format(parsed(summaryValues.inflation || "2"))}% · ±${number.format(parsed(summaryValues.range || "2"))} pp`;
  const toggleLabel = locale === "es"
    ? (collapsed ? "Abrir supuestos" : "Cerrar supuestos")
    : (collapsed ? "Open assumptions" : "Close assumptions");
  return (
    <aside
      aria-labelledby="compound-input-sidebar-title"
      onInput={(event) => {
        const form = event.currentTarget.closest("form");
        if (!form) return;
        window.requestAnimationFrame(() => {
          // Read mounted controls even while a request disables the fieldset.
          const readValue = (name: string, fallback: string) => {
            const field = form.elements.namedItem(name);
            return field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof RadioNodeList ? field.value : fallback;
          };
          setSummaryValues({
            principal: readValue("initial_principal", "0"),
            recurring: readValue("recurring_contribution.amount", "0"),
            frequency: readValue("recurring_contribution.frequency", "monthly"),
            years: readValue("duration_years", ""),
            expectedReturn: readValue("expected_annual_return_percent", "0"),
            fee: readValue("annual_fee_percent", "0"),
            inflation: readValue("expected_annual_inflation_percent", "0"),
            range: readValue("scenario_range_percentage_points", "0"),
          });
        });
      }}
      className={`relative flex min-h-0 w-full shrink-0 flex-col border-e border-border-default bg-container transition-[width] lg:max-w-[18.25rem] ${collapsed ? "lg:w-10 lg:min-w-10 lg:overflow-visible lg:border-e-0" : ""} ${className}`.trim()}
    >
      <header className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 border-b border-border-subtle px-4 py-4 ${collapsed ? "lg:min-w-0 lg:border-0 lg:p-0" : ""}`}>
        <h2 id="compound-input-sidebar-title" className={`text-base font-semibold leading-6 text-primary-foreground ${collapsed ? "lg:hidden" : ""}`}>
          {text.title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          aria-controls="compound-input-sidebar-fields"
          onClick={onToggleCollapsed}
          className={`min-h-11 shrink-0 lg:min-h-8 lg:px-2 ${collapsed ? "lg:absolute lg:start-0 lg:top-5 lg:z-20" : ""}`}
        >
          <span className="lg:hidden">{collapsed ? (locale === "es" ? "Editar" : "Edit") : (locale === "es" ? "Ocultar" : "Hide")}</span>
          <span aria-hidden="true" className={`size-4 bg-current [mask-image:url('/assets/svgs/panel-left.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${collapsed ? "rotate-180" : ""}`} />
        </Button>
        <p className={`col-span-2 text-sm leading-5 text-secondary-foreground ${collapsed ? "lg:hidden" : ""}`}>
          {collapsed ? summary : text.intro}
        </p>
      </header>

      <fieldset id="compound-input-sidebar-fields" disabled={submitting} className={`m-0 min-h-0 min-w-0 flex-1 border-0 px-4 py-5 disabled:opacity-100 ${collapsed ? "hidden" : ""}`}>
        <div className="space-y-6">
          <section
            aria-labelledby="contribution-fields-title"
            className="space-y-4"
          >
            <h3
              id="contribution-fields-title"
              className="text-sm font-semibold leading-5 text-primary-foreground"
            >
              {text.contributions}
            </h3>
            <FieldGroup className="gap-4">
              <div className="flex flex-col gap-2.5">
                <label htmlFor="display-currency" className="text-sm font-medium leading-5 text-primary-foreground">
                  {text.currency}
                </label>
                <Select
                  id="display-currency"
                  value={currency}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (isCurrency(value)) onCurrencyChange(value);
                  }}
                >
                  {currencies.map((option) => (
                    <option key={option} value={option}>
                      {option} ({getCurrencySymbol(option)})
                    </option>
                  ))}
                </Select>
              </div>
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
              <NumericField
                id="recurring-contribution-amount"
                name="recurring_contribution.amount"
                label={text.recurring}
                unit={getCurrencySymbol(currency)}
                defaultValue={initialValues?.["recurring_contribution.amount"] ?? "1000"}
                min="0"
                step="0.01"
                description={text.blank}
                onChange={(event) => setRecurringAmount(event.currentTarget.value)}
                optional
                optionalLabel={text.optional}
              />

              {parsed(recurringAmount) > 0 ? <SegmentedControl
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
              /> : null}

            </FieldGroup>
          </section>

          <section
            aria-labelledby="projection-fields-title"
            className="space-y-4 border-t border-border-subtle pt-5"
          >
            <h3
              id="projection-fields-title"
              className="text-sm font-semibold leading-5 text-primary-foreground"
            >
              {text.projection}
            </h3>
            <FieldGroup className="gap-4">
              <ProjectionSliderFields text={text} locale={locale} initialValues={initialValues} />
            </FieldGroup>
          </section>

          <section className="border-t border-border-subtle pt-5">
            <button
              type="button"
              aria-expanded={advancedOpen}
              aria-controls="advanced-assumption-fields"
              onClick={onToggleAdvanced}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md text-start text-sm font-semibold lg:hidden"
            >
              <span>{locale === "es" ? "Supuestos avanzados" : "Advanced assumptions"}</span>
              <span aria-hidden="true">{advancedOpen ? "−" : "+"}</span>
            </button>
            <p className="mt-1 text-xs leading-5 text-secondary-foreground lg:hidden">{advancedSummary}</p>
            <div id="advanced-assumption-fields" className={`${advancedOpen ? "" : "hidden"} space-y-6 pt-5 lg:block lg:pt-0`}>
              <FieldGroup className="gap-4">
              {parsed(recurringAmount) > 0 ? <SegmentedControl
                label={text.timing}
                name="recurring_contribution.timing"
                defaultValue={initialValues?.["recurring_contribution.timing"] ?? "beginning"}
                options={contributionTimings.map((option) => ({
                  ...option,
                  label:
                    option.value === "beginning" ? text.beginning : text.end,
                }))}
              /> : null}

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
              </FieldGroup>
              <ScenarioRangeField
                id="scenario-range"
                name="scenario_range_percentage_points"
                label={text.range}
                expectedReturn={parsed(summaryValues.expectedReturn)}
                text={text}
                locale={locale}
                initialValues={initialValues}
              />
          <section
            aria-labelledby="additional-fields-title"
            className="space-y-4"
          >
            <h3
              id="additional-fields-title"
              className="text-sm font-semibold leading-5 text-primary-foreground"
            >
              {text.other}
            </h3>
            <FieldGroup className="gap-4">
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
            </FieldGroup>
          </section>
            </div>
          </section>
        </div>
      </fieldset>

      <footer className={`border-t border-border-subtle px-4 py-4 ${collapsed ? "hidden" : ""}`}>
        <Button type="submit" disabled={submitting} className="min-h-12 w-full lg:min-h-10">
          {submitting ? <><span aria-hidden="true" className="me-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-e-transparent" />{text.calculate}<span className="sr-only"> {calculatingLabel}</span></> : text.calculate}
        </Button>
      </footer>
    </aside>
  );
}
