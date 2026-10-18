export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export function hasLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}
