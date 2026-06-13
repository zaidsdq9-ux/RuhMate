import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { UserDoc } from '@/types';

export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'rm_session';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(cookie, true);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  const snap = await adminDb.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
  if (!snap.exists) {
    return NextResponse.json({ success: false, error: 'User missing' }, { status: 404 });
  }

  const user = snap.data() as UserDoc;
  return NextResponse.json({
    success: true,
    data: {
      uid: user.uid,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      points_balance: user.points_balance,
      has_profile: user.has_profile,
      email_verified: user.email_verified,
    },
  });
}
