import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import type { UserDoc } from '@/types';

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

const Body = z.object({ action: z.enum(['resolve', 'dismiss']) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const ref = adminDb.collection(COLLECTIONS.REPORTS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
  }
  const nextStatus = parsed.data.action === 'resolve' ? 'resolved' : 'dismissed';
  await ref.update({
    status: nextStatus,
    resolved_at: FieldValue.serverTimestamp(),
    resolved_by: admin.uid,
  });
  logger.info({ actor: admin.uid, reportId: id, status: nextStatus }, 'report closed');
  return NextResponse.json({ success: true, data: { status: nextStatus } });
}
