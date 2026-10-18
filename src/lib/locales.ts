export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export function getIntlLocale(locale: Locale): "en-IE" | "es-ES" {
  return locale === "es" ? "es-ES" : "en-IE";
}

export function hasLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}
