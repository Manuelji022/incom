"use client";

import { useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { NumericField } from "@/components/ui/numeric-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProjectionSliderFields } from "@/components/slider-fields";
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
}: CompoundInputSidebarProps) {
  const [recurringAmount, setRecurringAmount] = useState("1000");
  const toggleLabel = locale === "es"
    ? (collapsed ? "Abrir supuestos" : "Cerrar supuestos")
    : (collapsed ? "Open assumptions" : "Close assumptions");
  return (
    <aside
      aria-labelledby="compound-input-sidebar-title"
      className={`relative flex min-h-0 w-full shrink-0 flex-col border-e border-border-default bg-container transition-[width] lg:max-w-[18.25rem] ${collapsed ? "lg:w-0 lg:min-w-0 lg:overflow-visible lg:border-e-0" : ""} ${className}`.trim()}
    >
      <header className={`flex items-start justify-between gap-2 border-b border-border-subtle px-4 py-5 ${collapsed ? "lg:min-w-0 lg:border-0 lg:p-0" : ""}`}>
        <div className={collapsed ? "lg:hidden" : ""}>
          <h2
            id="compound-input-sidebar-title"
            className="text-base font-semibold leading-6 text-primary-foreground"
          >
            {text.title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-secondary-foreground">
            {text.intro}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          aria-controls="compound-input-sidebar-fields"
          onClick={onToggleCollapsed}
          className={`shrink-0 ${collapsed ? "lg:absolute lg:start-0 lg:top-0 lg:z-20" : ""}`}
        >
          <span
            aria-hidden="true"
            className={`size-4 bg-current [mask-image:url('/assets/svgs/panel-left.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${collapsed ? "rotate-180" : ""}`}
          />
        </Button>
      </header>

      <fieldset id="compound-input-sidebar-fields" disabled={submitting || collapsed} className={`m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 px-4 py-5 disabled:opacity-100 ${collapsed ? "hidden" : ""}`}>
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
              <NumericField
                id="initial-principal"
                name="initial_principal"
                label={text.initial}
                unit="€"
                defaultValue="40000"
                min="0"
                step="0.01"
                optional
                optionalLabel={text.optional}
                required
              />
              <NumericField
                id="recurring-contribution-amount"
                name="recurring_contribution.amount"
                label={text.recurring}
                unit="€"
                defaultValue="1000"
                min="0"
                step="0.01"
                description={text.blank}
                onChange={(event) => setRecurringAmount(event.currentTarget.value)}
                optional
                optionalLabel={text.optional}
              />

              {Number(recurringAmount) > 0 ? <SegmentedControl
                label={text.frequency}
                name="recurring_contribution.frequency"
                defaultValue="monthly"
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

              {Number(recurringAmount) > 0 ? <SegmentedControl
                label={text.timing}
                name="recurring_contribution.timing"
                defaultValue="beginning"
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
                defaultValue="2"
                min="0"
                step="0.1"
                optional
                optionalLabel={text.optional}
              />
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
              <ProjectionSliderFields text={text} locale={locale} />
            </FieldGroup>
          </section>

          <section
            aria-labelledby="additional-fields-title"
            className="space-y-4 border-t border-border-subtle pt-5"
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
                defaultValue="0.05"
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
                defaultValue="2"
                step="0.1"
                optional
                optionalLabel={text.optional}
              />
            </FieldGroup>
          </section>
        </div>
      </fieldset>

      <footer className={`border-t border-border-subtle px-4 py-4 ${collapsed ? "hidden" : ""}`}>
        <Button type="submit" disabled={submitting || collapsed} className="w-full">
          {submitting ? <><span aria-hidden="true" className="me-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-e-transparent" />{text.calculate}<span className="sr-only"> {calculatingLabel}</span></> : text.calculate}
        </Button>
      </footer>
    </aside>
  );
}
