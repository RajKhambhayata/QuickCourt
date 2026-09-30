/** Normalise a user-entered phone number to the E.164 format required by SMS providers. */
export function normalizePhoneNumber(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Accept common formatting characters, but require an explicit international prefix.
  const normalized = trimmed.replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}
