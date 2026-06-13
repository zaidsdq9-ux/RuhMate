/**
 * Phone normalisation shared by the OTP send step, the verify endpoint, and the
 * publish gate. All three MUST agree on the canonical form, otherwise a verified
 * number would never match the stored contact number.
 *
 * Default region is Sri Lanka (+94) — the client's market. The rules:
 *   - strip spaces, dashes, parentheses, dots
 *   - keep an existing leading "+" (already international)
 *   - a leading "0" is the local trunk prefix → replace with the country code
 *   - otherwise prefix the default country code
 */
const DEFAULT_COUNTRY_CODE = '+94';

export function normalizePhoneE164(raw: string, countryCode = DEFAULT_COUNTRY_CODE): string {
  if (!raw) return '';
  // Keep digits and a single leading plus.
  let s = raw.trim().replace(/[^\d+]/g, '');
  if (s.startsWith('+')) {
    // Collapse any stray pluses after the first.
    return '+' + s.slice(1).replace(/\+/g, '');
  }
  s = s.replace(/\+/g, '');
  if (s.startsWith('0')) {
    return countryCode + s.slice(1);
  }
  return countryCode + s;
}

/** Loose check that a normalised value looks like a usable E.164 number. */
export function isLikelyE164(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}
