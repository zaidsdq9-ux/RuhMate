import { z } from 'zod';
import {
  ABOUT_ME_MAX,
  FAMILY_DETAILS_MAX,
  MAX_AGE_YEARS,
  MIN_AGE_YEARS,
  PREFERENCE_TEXT_MAX,
} from '@/lib/profile/constants';

const trimmedString = (max: number, min = 0) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max);

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

function ageFromDob(iso: string): number | null {
  const dob = new Date(iso);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

const ageBoundedDob = z
  .string()
  .refine((s) => !Number.isNaN(new Date(s).getTime()), { message: 'Invalid date' })
  .refine((s) => {
    const a = ageFromDob(s);
    return a !== null && a >= MIN_AGE_YEARS && a <= MAX_AGE_YEARS;
  }, { message: `Age must be between ${MIN_AGE_YEARS} and ${MAX_AGE_YEARS}` });

// Stored canonical unit is cm. The profile form collects feet+inches; the
// upper bound covers the tallest dropdown selection (7'11" ≈ 241 cm).
const heightCm = z.coerce.number().int().min(120).max(245);
const monthlyIncome = z.coerce.number().int().min(0).max(100_000_000).optional();
const countNonNeg = z.coerce.number().int().min(0).max(20);

const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;
const phoneSchema = z.string().trim().regex(PHONE_RE, 'Invalid phone number');

const registeredBySchema = z.enum([
  'self',
  'son',
  'daughter',
  'brother',
  'sister',
  'relative',
  'friend',
]);

// Draft = everything optional except display_name + registered_by (label + relationship).
export const DraftProfileSchema = z.object({
  registered_by: registeredBySchema.optional(),
  display_name: z.string().trim().min(1, 'Required').max(80),
  gender: z.enum(['male', 'female']).optional(),
  date_of_birth: ageBoundedDob.optional(),
  marital_status: z.enum(['never_married', 'divorced', 'widowed']).optional(),
  height_cm: heightCm.optional(),
  country: optionalTrimmed(60),
  current_city: optionalTrimmed(80),
  district: optionalTrimmed(60),
  nationality: optionalTrimmed(60),
  ethnicity: optionalTrimmed(60),
  mother_tongue: optionalTrimmed(60),

  education_level: optionalTrimmed(60),
  occupation: optionalTrimmed(120),
  employment_type: optionalTrimmed(60),
  company_industry: optionalTrimmed(120),
  monthly_income: monthlyIncome,
  about_me: optionalTrimmed(ABOUT_ME_MAX),

  father_occupation: optionalTrimmed(120),
  mother_occupation: optionalTrimmed(120),
  brothers_count: countNonNeg.optional(),
  sisters_count: countNonNeg.optional(),
  family_details: optionalTrimmed(FAMILY_DETAILS_MAX),

  willing_to_relocate: z.boolean().optional(),
  location_preference: z.enum(['local', 'abroad', 'either']).optional(),

  preference_text: optionalTrimmed(PREFERENCE_TEXT_MAX),

  contact_phone: optionalTrimmed(40),
  contact_whatsapp: optionalTrimmed(40),
});

// Publish = strict.
export const PublishProfileSchema = z.object({
  registered_by: registeredBySchema,
  display_name: trimmedString(80, 1),
  gender: z.enum(['male', 'female']),
  date_of_birth: ageBoundedDob,
  marital_status: z.enum(['never_married', 'divorced', 'widowed']),
  height_cm: heightCm,
  country: trimmedString(60, 1),
  current_city: trimmedString(80, 1),
  district: optionalTrimmed(60),
  nationality: trimmedString(60, 1),
  ethnicity: optionalTrimmed(60),
  mother_tongue: trimmedString(60, 1),

  education_level: trimmedString(60, 1),
  occupation: trimmedString(120, 1),
  employment_type: trimmedString(60, 1),
  company_industry: optionalTrimmed(120),
  monthly_income: monthlyIncome,
  about_me: trimmedString(ABOUT_ME_MAX, 30),

  father_occupation: trimmedString(120, 1),
  mother_occupation: trimmedString(120, 1),
  brothers_count: countNonNeg,
  sisters_count: countNonNeg,
  family_details: trimmedString(FAMILY_DETAILS_MAX, 10),

  willing_to_relocate: z.boolean(),
  location_preference: z.enum(['local', 'abroad', 'either']),

  preference_text: trimmedString(PREFERENCE_TEXT_MAX, 20),

  contact_phone: phoneSchema,
  contact_whatsapp: phoneSchema,
});

export type DraftProfileInput = z.infer<typeof DraftProfileSchema>;
export type PublishProfileInput = z.infer<typeof PublishProfileSchema>;

export { ageFromDob };
