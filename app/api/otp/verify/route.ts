import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { verifyOtp } from '@/lib/otp/service';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { normalizeSriLankanPhone } from '@/lib/utils/phone';
import { VerifyOtpSchema } from '@/lib/validation/otp';

export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'rm_session';

async function authedUid(req: NextRequest): Promise<string | NextResponse> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    return decoded.uid;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}

const ERROR_MESSAGES = {
  not_found: 'This code expired. Please request a new one.',
  expired: 'This code expired. Please request a new one.',
  too_many_attempts: 'Too many incorrect attempts. Please request a new code.',
  invalid: 'Invalid code. Please try again.',
} as const;

export async function POST(req: NextRequest) {
  const uid = await authedUid(req);
  if (typeof uid !== 'string') return uid;

  const rl = await rateLimit(req, 'otp:verify', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const norm = normalizeSriLankanPhone(parsed.data.phone);
  if (!norm.ok || !norm.value) {
    return NextResponse.json({ success: false, error: norm.error }, { status: 400 });
  }
  const phone = norm.value;
  const { otp, purpose } = parsed.data;

  const result = await verifyOtp(uid, phone, otp, purpose);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES[result.reason] },
      { status: 400 },
    );
  }

  // Reserved for future use — WhatsApp has no verified-state field on the
  // profile doc yet, so there is nothing to persist beyond the OTP record.
  if (purpose === 'whatsapp_verification') {
    return NextResponse.json({ success: true, data: { verified_phone_number: phone } });
  }

  const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(uid);
  const snap = await profileRef.get();
  const patch: Record<string, unknown> = {
    id: uid,
    user_id: uid,
    phone_verified: true,
    verified_phone_number: phone,
    phone_verified_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };
  if (!snap.exists) {
    // Verification can run before the first draft autosave lands — create a
    // minimal draft so the verification has somewhere to live.
    patch.status = 'draft';
    patch.created_at = FieldValue.serverTimestamp();
  }
  await profileRef.set(patch, { merge: true });

  logger.info({ uid, purpose, action: 'phone_verified' }, 'profile phone verified via textlk otp');
  return NextResponse.json({ success: true, data: { verified_phone_number: phone } });
}
