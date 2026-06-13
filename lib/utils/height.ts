/**
 * Height helpers. `height_cm` remains the single canonical stored value
 * (validation, embedding, and all existing data depend on it). The profile
 * form collects feet + inches and converts to cm on save; display converts cm
 * back to feet/inches. Old cm-only records therefore keep working unchanged.
 */

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

export interface FeetInches {
  feet: number;
  inches: number;
}

/** Convert centimetres to whole feet + inches (rounded to the nearest inch). */
export function cmToFeetInches(cm: number): FeetInches {
  const totalInches = Math.round(cm / CM_PER_INCH);
  let feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = totalInches % INCHES_PER_FOOT;
  if (inches === INCHES_PER_FOOT) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

/** Convert feet + inches to centimetres (rounded to the nearest cm). */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * INCHES_PER_FOOT + inches;
  return Math.round(totalInches * CM_PER_INCH);
}

/** Human-readable height, e.g. `5'7"`. Returns "—" for missing/invalid data. */
export function formatHeight(cm: number | null | undefined): string {
  if (!cm || !Number.isFinite(cm) || cm <= 0) return '—';
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

/** Feet options offered in the profile form (sensible adult range). */
export const HEIGHT_FEET_OPTIONS = [4, 5, 6, 7] as const;
/** Inch options 0–11. */
export const HEIGHT_INCH_OPTIONS = Array.from({ length: INCHES_PER_FOOT }, (_, i) => i);
