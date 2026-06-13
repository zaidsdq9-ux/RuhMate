import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'rm_session';

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, 'auth:sync-verified');
  if (!rl.ok) return tooManyRequests(rl);

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(cookie, true);
  } catch (err) {
    logger.warn({ err }, 'sync-verified: session verify failed');
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  const record = await adminAuth.getUser(decoded.uid);
  await adminDb.collection(COLLECTIONS.USERS).doc(decoded.uid).update({
    email_verified: record.emailVerified,
    updated_at: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    success: true,
    data: { email_verified: record.emailVerified },
  });
}
