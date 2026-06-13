import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import type { ProfileDoc, UserDoc } from '@/types';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function authedAdmin(req: NextRequest): Promise<UserDoc | NextResponse> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const snap = await adminDb.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'User missing' }, { status: 401 });
    }
    const me = snap.data() as UserDoc;
    if (me.role !== 'admin' || !adminEmails().includes(me.email.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
    }
    return me;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}

const Body = z.object({
  action: z.enum(['hide', 'unhide']),
  reason: z.string().trim().max(200).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { uid } = await params;

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const ref = adminDb.collection(COLLECTIONS.PROFILES).doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
  }
  const before = snap.data() as ProfileDoc;
  const nextStatus = parsed.data.action === 'hide' ? 'hidden' : 'published';

  await ref.update({
    status: nextStatus,
    updated_at: FieldValue.serverTimestamp(),
  });
  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: admin.uid,
    action: parsed.data.action === 'hide' ? 'disable_user' : 'enable_user',
    target_id: uid,
    before: { status: before.status },
    after: { status: nextStatus },
    reason: parsed.data.reason ?? null,
    created_at: FieldValue.serverTimestamp(),
  });
  logger.info(
    { actor: admin.uid, target: uid, action: parsed.data.action, nextStatus },
    'profile visibility change',
  );

  return NextResponse.json({ success: true, data: { status: nextStatus } });
}
