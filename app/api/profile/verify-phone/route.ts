import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

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

const BodySchema = z.object({ token: z.string().min(20).max(4096) });

/**
 * Marks the caller's profile phone as verified. The client performs the actual
 * SMS OTP via Firebase phone auth (on a secondary app) and posts the resulting
 * phone-auth ID token here. We verify that token with the Admin SDK and trust
 * its `phone_number` claim — it cannot be forged.
 */
export async function POST(req: NextRequest) {
  const uid = await authedUid(req);
  if (typeof uid !== 'string') return uid;

  const rl = await rateLimit(req, 'profile:verify-phone', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  let phoneNumber: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(parsed.data.token);
    const provider = decoded.firebase?.sign_in_provider;
    phoneNumber = decoded.phone_number;
    if (provider !== 'phone' || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Token is not a phone verification.' },
        { status: 400 },
      );
    }
  } catch (err) {
    logger.warn({ uid, err: String(err) }, 'verify-phone: token verification failed');
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 400 },
    );
  }

  const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(uid);
  const snap = await profileRef.get();

  const verificationPatch: Record<string, unknown> = {
    id: uid,
    user_id: uid,
    phone_verified: true,
    verified_phone_number: phoneNumber,
    phone_verified_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };
  if (!snap.exists) {
    // Verification can run before the first draft autosave lands — create a
    // minimal draft so the verification has somewhere to live.
    verificationPatch.status = 'draft';
    verificationPatch.created_at = FieldValue.serverTimestamp();
  }

  await profileRef.set(verificationPatch, { merge: true });

  logger.info({ uid, action: 'phone_verified' }, 'profile phone verified');
  return NextResponse.json({ success: true, data: { verified_phone_number: phoneNumber } });
}
