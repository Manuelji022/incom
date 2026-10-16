import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type NumericFieldProps = {
  id: string;
  label: string;
  name: string;
  unit: string;
  defaultValue: string;
  description?: string;
} & Omit<
  ComponentProps<typeof Input>,
  "aria-describedby" | "className" | "defaultValue" | "id" | "name" | "type"
>;

type CompoundInputSidebarProps = Pick<ComponentProps<"aside">, "className">;

const selectClassName =
  "h-10 w-full min-w-0 rounded-md border border-border-default bg-container px-3 py-2 text-sm text-primary-foreground outline-none transition-colors focus-visible:border-brand-border-focus focus-visible:ring-2 focus-visible:ring-brand-border-focus/30";

function NumericField({
  id,
  label,
  name,
  unit,
  defaultValue,
  description,
  ...inputProps
}: NumericFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          {...inputProps}
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          defaultValue={defaultValue}
          aria-describedby={descriptionId}
          className="pr-14 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-tertiary-foreground"
        >
          {unit}
        </span>
      </div>
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  );
}

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

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="recurring-contribution-frequency">
                    Frequency
                  </FieldLabel>
                  <select
                    id="recurring-contribution-frequency"
                    name="recurring_contribution.frequency"
                    defaultValue="monthly"
                    className={selectClassName}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="recurring-contribution-timing">Timing</FieldLabel>
                  <select
                    id="recurring-contribution-timing"
                    name="recurring_contribution.timing"
                    defaultValue="end"
                    className={selectClassName}
                  >
                    <option value="beginning">Beginning</option>
                    <option value="end">End of period</option>
                  </select>
                </Field>
              </div>

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

      <footer className="border-t border-border-subtle px-4 py-4">
        <Button type="submit" className="w-full">
          Calculate projection
        </Button>
      </footer>
    </aside>
  );
}
