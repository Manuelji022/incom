import { getIntlLocale, type Locale } from "@/lib/locales";

export const currencies = ["EUR", "USD", "GBP"] as const;
export type Currency = (typeof currencies)[number];

const currencySymbols: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

export function isCurrency(value: string): value is Currency {
  return currencies.some((currency) => currency === value);
}

export function getCurrencySymbol(currency: Currency) {
  return currencySymbols[currency];
}

export function getCurrencyFormatter(
  locale: Locale,
  currency: Currency,
  options: Omit<Intl.NumberFormatOptions, "currency" | "style"> = {},
) {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    ...options,
    style: "currency",
    currency,
  });
}
