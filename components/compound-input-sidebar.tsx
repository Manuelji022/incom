import type { ComponentProps } from "react";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NumericField } from "@/components/ui/numeric-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";

type CompoundInputSidebarProps = Pick<ComponentProps<"aside">, "className">;

export function CompoundInputSidebar({
  className = "",
}: CompoundInputSidebarProps) {
  return (
    <aside
      aria-labelledby="compound-input-sidebar-title"
      className={`flex min-h-0 w-full max-w-[18.25rem] shrink-0 flex-col border-r border-border-default bg-container ${className}`.trim()}
    >
      <header className="border-b border-border-subtle px-4 py-5">
        <h2
          id="compound-input-sidebar-title"
          className="text-base font-semibold leading-6 text-primary-foreground"
        >
          Projection inputs
        </h2>
        <p className="mt-1 text-sm leading-5 text-secondary-foreground">
          Set the assumptions for your projection.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          <section aria-labelledby="contribution-fields-title" className="space-y-4">
            <h3
              id="contribution-fields-title"
              className="text-sm font-semibold leading-5 text-primary-foreground"
            >
              Contributions
            </h3>
            <FieldGroup className="gap-4">
              <NumericField
                id="initial-principal"
                name="initial_principal"
                label="Initial investment"
                unit="€"
                defaultValue="40000"
                min="0"
                step="0.01"
                required
              />
              <NumericField
                id="recurring-contribution-amount"
                name="recurring_contribution.amount"
                label="Recurring contribution"
                unit="€"
                defaultValue="1000"
                min="0"
                step="0.01"
                description="Leave blank to invest only the initial amount."
              />

              <SegmentedControl
                label="Contribution frequency"
                name="recurring_contribution.frequency"
                defaultValue="monthly"
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "annual", label: "Annual" },
                ]}
              />

              <Field>
                <FieldLabel htmlFor="recurring-contribution-timing">Timing</FieldLabel>
                <Select
                  id="recurring-contribution-timing"
                  name="recurring_contribution.timing"
                  defaultValue="end"
                >
                  <option value="beginning">Beginning</option>
                  <option value="end">End of period</option>
                </Select>
              </Field>

              <NumericField
                id="contribution-increase"
                name="recurring_contribution.annual_increase_percent"
                label="Annual contribution increase"
                unit="%"
                defaultValue="2"
                min="0"
                step="0.1"
              />
            </FieldGroup>
          </section>

          <section aria-labelledby="projection-fields-title" className="space-y-4 border-t border-border-subtle pt-5">
            <h3
              id="projection-fields-title"
              className="text-sm font-semibold leading-5 text-primary-foreground"
            >
              Projection
            </h3>
            <FieldGroup className="gap-4">
              <NumericField
                id="duration-years"
                name="duration_years"
                label="Investment horizon"
                unit="years"
                defaultValue="25"
                min="1"
                max="100"
                step="1"
                required
              />
              <NumericField
                id="expected-annual-return"
                name="expected_annual_return_percent"
                label="Expected annual return"
                unit="%"
                defaultValue="7.8"
                step="0.1"
                required
                description="Effective annual return before fees."
              />
            </FieldGroup>
          </section>

          <section aria-labelledby="additional-fields-title" className="space-y-4 border-t border-border-subtle pt-5">
            <h3
              id="additional-fields-title"
              className="text-sm font-semibold leading-5 text-primary-foreground"
            >
              Other assumptions
            </h3>
            <FieldGroup className="gap-4">
              <NumericField
                id="annual-fee"
                name="annual_fee_percent"
                label="Annual fee"
                unit="%"
                defaultValue="0.05"
                min="0"
                step="0.01"
                description="0.08 means 0.08% per year."
              />
              <NumericField
                id="expected-inflation"
                name="expected_annual_inflation_percent"
                label="Expected inflation"
                unit="%"
                defaultValue="2"
                step="0.1"
              />
              <NumericField
                id="scenario-range"
                name="scenario_range_percentage_points"
                label="Scenario range"
                unit="pp"
                defaultValue="2"
                min="0"
                step="0.1"
                description="Percentage points below and above the expected return."
              />
            </FieldGroup>
          </section>
        </div>
      </div>
    </aside>
  );
}
