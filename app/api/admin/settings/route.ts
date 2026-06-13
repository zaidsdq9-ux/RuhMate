import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS, SETTINGS_DOC_ID } from '@/lib/firebase/collections';
import { invalidateSettingsCache } from '@/lib/config';
import { logger } from '@/lib/logger';
import type { UserDoc, SettingsDoc } from '@/types';

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
  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
  const snap = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
  if (!snap.exists) {
    return NextResponse.json({ success: false, error: 'User missing' }, { status: 401 });
  }
  const me = snap.data() as UserDoc;
  if (me.role !== 'admin' || !adminEmails().includes(me.email.toLowerCase())) {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }
  return me;
}

const Schema = z.object({
  contact_unlock_cost: z.coerce.number().int().min(0).max(10_000).optional(),
  view_details_cost: z.coerce.number().int().min(0).max(10_000).optional(),
  maintenance_mode: z.boolean().optional(),
  maintenance_message: z.string().trim().max(500).optional(),
  signup_open: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const ref = adminDb.collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID);
  const before = (await ref.get()).data() as Partial<SettingsDoc> | undefined;

  await ref.set(
    {
      ...parsed.data,
      updated_at: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  invalidateSettingsCache();

  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: admin.uid,
    action: 'edit_settings',
    before: before ?? null,
    after: parsed.data,
    created_at: FieldValue.serverTimestamp(),
  });
  logger.info({ actor: admin.uid, patch: parsed.data }, 'settings updated');

  return NextResponse.json({ success: true, data: { updated: true } });
}
