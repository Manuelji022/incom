const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/;

/** Normalize a decimal comma without converting through a floating point number. */
export function normalizeDecimalInput(value: string): string {
  const trimmed = value.trim();
  if (!DECIMAL_PATTERN.test(trimmed)) return trimmed;
  return trimmed.replace(",", ".");
}

export function isValidDecimalInput(value: string): boolean {
  return value.trim() === "" || DECIMAL_PATTERN.test(value.trim());
}
