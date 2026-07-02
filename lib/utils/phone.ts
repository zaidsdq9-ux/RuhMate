/**
 * Sri Lankan mobile number normalisation, shared by the OTP send/verify routes,
 * the Text.lk SMS client, and the publish gate. All of them MUST agree on the
 * canonical form, otherwise a verified number would never match the stored
 * contact number.
 *
 * Canonical form (also the exact format Text.lk expects as `recipient`):
 *   "94771234567" — country code "94" + mobile prefix "7" + 8 digits, no "+".
 */

export interface PhoneNormalizeResult {
  ok: boolean;
  value?: string;
  error?: string;
}

const SL_MOBILE_RE = /^94[7][0-9]{8}$/;

export function normalizeSriLankanPhone(raw: string): PhoneNormalizeResult {
  if (!raw || !raw.trim()) {
    return { ok: false, error: 'Enter a valid Sri Lankan mobile number.' };
  }

  // Strip spaces, hyphens, brackets, dots.
  let s = raw.trim().replace(/[\s\-().]/g, '');
  const hadPlus = s.startsWith('+');
  if (hadPlus) s = s.slice(1);

  if (!/^\d+$/.test(s)) {
    return { ok: false, error: 'Enter a valid Sri Lankan mobile number.' };
  }

  if (!hadPlus && s.startsWith('0') && s.length === 10) {
    // Local trunk prefix, e.g. 0771234567.
    s = '94' + s.slice(1);
  } else if (!hadPlus && !s.startsWith('94') && s.length === 9 && s.startsWith('7')) {
    // Bare subscriber number, e.g. 771234567.
    s = '94' + s;
  }

  if (!SL_MOBILE_RE.test(s)) {
    return { ok: false, error: 'Please include a valid +94 mobile number.' };
  }

  return { ok: true, value: s };
}

/** Format a normalized "94771234567" value for display, e.g. "+94 77 123 4567". */
export function formatSriLankanPhoneForDisplay(normalized: string): string {
  if (!SL_MOBILE_RE.test(normalized)) return normalized;
  return `+${normalized.slice(0, 2)} ${normalized.slice(2, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
}
