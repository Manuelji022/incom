import type { Locale } from "@/lib/locales";

function getValidationMessage(field: HTMLInputElement, locale: Locale) {
  const { validity } = field;
  const spanish = locale === "es";
  if (validity.customError) return field.validationMessage;
  if (validity.badInput || validity.typeMismatch) {
    return spanish ? "Introduce un número válido." : "Enter a valid number.";
  }
  if (validity.valueMissing) {
    return spanish ? "Introduce un valor." : "Enter a value.";
  }
  if (validity.rangeUnderflow) {
    return spanish ? `Introduce un valor mayor o igual que ${field.min}.` : `Enter a value greater than or equal to ${field.min}.`;
  }
  if (validity.rangeOverflow) {
    return spanish ? `Introduce un valor menor o igual que ${field.max}.` : `Enter a value less than or equal to ${field.max}.`;
  }
  if (validity.stepMismatch) {
    return spanish ? `Usa incrementos de ${field.step || "1"}.` : `Use increments of ${field.step || "1"}.`;
  }
  return spanish ? "Revisa este valor." : "Check this value.";
}

export function showFieldValidation(field: HTMLInputElement, locale: Locale) {
  if (field.validity.valid) return;
  field.setAttribute("aria-invalid", "true");
  const errorId = `${field.id}-inline-error`;
  const describedBy = new Set(field.getAttribute("aria-describedby")?.split(" ").filter(Boolean));
  describedBy.add(errorId);
  field.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
  let detail = document.getElementById(errorId);
  if (!detail) {
    detail = document.createElement("p");
    detail.id = errorId;
    detail.className = "mt-1 text-xs text-danger-foreground";
    field.parentElement?.insertAdjacentElement("afterend", detail);
  }
  detail.textContent = getValidationMessage(field, locale);
}

export function clearFieldValidation(field: HTMLInputElement | HTMLSelectElement) {
  field.removeAttribute("aria-invalid");
  if (field instanceof HTMLInputElement) field.setCustomValidity("");
  const errorId = `${field.id}-inline-error`;
  document.getElementById(errorId)?.remove();
  const describedBy = field.getAttribute("aria-describedby")?.split(" ").filter((id) => id !== errorId).join(" ");
  if (describedBy) field.setAttribute("aria-describedby", describedBy);
  else field.removeAttribute("aria-describedby");
}
