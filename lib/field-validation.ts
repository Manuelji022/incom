export function clearFieldValidation(field: HTMLInputElement | HTMLSelectElement) {
  field.removeAttribute("aria-invalid");
  if (field instanceof HTMLInputElement) field.setCustomValidity("");
  const errorId = `${field.id}-inline-error`;
  document.getElementById(errorId)?.remove();
  const describedBy = field.getAttribute("aria-describedby")?.split(" ").filter((id) => id !== errorId).join(" ");
  if (describedBy) field.setAttribute("aria-describedby", describedBy);
  else field.removeAttribute("aria-describedby");
}
