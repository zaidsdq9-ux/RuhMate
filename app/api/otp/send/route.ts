import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { OtpCooldownError, requestOtp } from '@/lib/otp/service';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { normalizeSriLankanPhone } from '@/lib/utils/phone';
import { SendOtpSchema } from '@/lib/validation/otp';
import type { ProfileDoc } from '@/types';

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

export async function POST(req: NextRequest) {
  const uid = await authedUid(req);
  if (typeof uid !== 'string') return uid;

  const rl = await rateLimit(req, 'otp:send', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const norm = normalizeSriLankanPhone(parsed.data.phone);
  if (!norm.ok || !norm.value) {
    return NextResponse.json({ success: false, error: norm.error }, { status: 400 });
  }
  const phone = norm.value;
  const { purpose } = parsed.data;

  // Already verified and unchanged — no need to send another code.
  if (purpose !== 'whatsapp_verification') {
    const profileSnap = await adminDb.collection(COLLECTIONS.PROFILES).doc(uid).get();
    const profile = profileSnap.data() as ProfileDoc | undefined;
    if (profile?.phone_verified === true && profile.verified_phone_number === phone) {
      return NextResponse.json({ success: true, data: { alreadyVerified: true } });
    }
  }

  try {
    await requestOtp(uid, phone, purpose);
  } catch (err) {
    if (err instanceof OtpCooldownError) {
      return NextResponse.json(
        { success: false, error: 'Please wait before requesting another code.' },
        { status: 429, headers: { 'Retry-After': String(err.retryAfterSec) } },
      );
    }
    logger.error({ uid, purpose, err: String(err) }, 'otp/send: failed');
    return NextResponse.json(
      { success: false, error: 'Could not send the verification code. Please try again.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, data: { message: 'Verification code sent.' } });
}
