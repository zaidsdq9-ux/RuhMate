import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'rm_session';
const SESSION_EXPIRES_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

const BodySchema = z.object({
  idToken: z.string().min(10),
  full_name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  provider: z.enum(['password', 'google']).optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(parsed.idToken, true);
  } catch (err) {
    logger.warn({ err }, 'session route: token verification failed');
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  const uid = decoded.uid;
  const email = (decoded.email ?? '').toLowerCase();
  const emailVerified = decoded.email_verified ?? false;
  const providerFromToken = decoded.firebase?.sign_in_provider === 'google.com' ? 'google.com' : 'password';

  const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const adminAllowlist = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAllowlistedAdmin = adminAllowlist.includes(email);

    await userRef.set({
      uid,
      full_name: parsed.full_name ?? decoded.name ?? '',
      email,
      email_verified: emailVerified,
      phone: parsed.phone ?? '',
      role: isAllowlistedAdmin ? 'admin' : 'user',
      status: 'active',
      points_balance: 0,
      has_profile: false,
      auth_providers: [providerFromToken],
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    logger.info({ uid, email, provider: providerFromToken }, 'user created');
  } else {
    const data = userSnap.data() ?? {};
    const providers: string[] = Array.isArray(data.auth_providers) ? data.auth_providers : [];
    const patch: Record<string, unknown> = {
      email_verified: emailVerified,
      updated_at: FieldValue.serverTimestamp(),
    };
    if (!providers.includes(providerFromToken)) {
      patch.auth_providers = FieldValue.arrayUnion(providerFromToken);
    }
    if (data.status === 'disabled') {
      return NextResponse.json({ success: false, error: 'Account disabled' }, { status: 403 });
    }
    await userRef.update(patch);
  }

  let sessionCookie: string;
  try {
    sessionCookie = await adminAuth.createSessionCookie(parsed.idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });
  } catch (err) {
    logger.error({ err }, 'createSessionCookie failed');
    return NextResponse.json({ success: false, error: 'Could not start session' }, { status: 500 });
  }

  const res = NextResponse.json({ success: true, data: { uid } });
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRES_MS / 1000,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, data: { signed_out: true } });
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
