/** Normalise a user-entered phone number to the E.164 format required by SMS providers. */
export function normalizePhoneNumber(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Accept international formats and common local numbers
  const normalized = trimmed.replace(/[\s().-]/g, '');
  if (/^\+[1-9]\d{7,14}$/.test(normalized)) {
    return normalized;
  }
  if (/^\d{10}$/.test(normalized)) {
    return `+91${normalized}`;
  }
  if (/^\d{7,15}$/.test(normalized)) {
    return `+${normalized}`;
  }
  return normalized.length >= 7 ? normalized : null;
}
