import { z } from 'zod';

export const OtpPurposeSchema = z.enum([
  'profile_phone_verification',
  'profile_creation',
  'whatsapp_verification',
]);

export const SendOtpSchema = z.object({
  phone: z.string().trim().min(7).max(20),
  purpose: OtpPurposeSchema.default('profile_phone_verification'),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().trim().min(7).max(20),
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
  purpose: OtpPurposeSchema.default('profile_phone_verification'),
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
