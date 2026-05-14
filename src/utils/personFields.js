/** Letras Unicode (incluye tildes, ñ, etc.) y espacios; una o más palabras separadas por espacio. */
const NAME_SUBMIT_PATTERN = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u;

/** Quita del nombre todo lo que no sea letra o espacio (números y símbolos). */
export function sanitizePersonNameInput(raw) {
  return String(raw ?? '').replace(/[^\p{L}\s]/gu, '');
}

/** Solo dígitos, máximo `maxLen` (10 para teléfono CO). */
export function sanitizePhoneDigits(raw, maxLen = 10) {
  return String(raw ?? '').replace(/\D/g, '').slice(0, maxLen);
}

export function validatePersonNameForSubmit(name) {
  const t = String(name ?? '').trim();
  if (!t) return 'El nombre es requerido';
  if (!NAME_SUBMIT_PATTERN.test(t)) {
    return 'El nombre solo puede contener letras y espacios (sin números ni caracteres especiales)';
  }
  return null;
}

export function validatePhone10(phone) {
  if (!/^\d{10}$/.test(String(phone ?? ''))) {
    return 'El teléfono debe tener exactamente 10 dígitos (solo números, sin letras ni símbolos)';
  }
  return null;
}
