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

const PackSchema = z.object({
  id: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_-]+$/, 'lowercase letters, digits, hyphens or underscores only'),
  name: z.string().trim().min(1).max(60),
  points: z.coerce.number().int().min(1).max(1_000_000),
  price_lkr: z.coerce.number().int().min(1).max(10_000_000),
  active: z.boolean().default(true),
  display_order: z.coerce.number().int().min(0).max(1000).default(0),
});

const PatchSchema = z.object({
  id: z.string().trim().min(2).max(40),
  name: z.string().trim().min(1).max(60).optional(),
  points: z.coerce.number().int().min(1).max(1_000_000).optional(),
  price_lkr: z.coerce.number().int().min(1).max(10_000_000).optional(),
  active: z.boolean().optional(),
  display_order: z.coerce.number().int().min(0).max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => null);
  const parsed = PackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid pack', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ref = adminDb.collection(COLLECTIONS.POINT_PACKS).doc(parsed.data.id);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ success: false, error: 'Pack id already exists' }, { status: 409 });
  }
  await ref.set({ ...parsed.data, created_at: FieldValue.serverTimestamp() });
  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: admin.uid,
    action: 'create_pack',
    target_id: parsed.data.id,
    after: parsed.data,
    created_at: FieldValue.serverTimestamp(),
  });
  logger.info({ actor: admin.uid, packId: parsed.data.id }, 'pack created');
  return NextResponse.json({ success: true, data: { pack: parsed.data } });
}

export async function PATCH(req: NextRequest) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const { id, ...patch } = parsed.data;
  const ref = adminDb.collection(COLLECTIONS.POINT_PACKS).doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ success: false, error: 'Pack not found' }, { status: 404 });
  }
  await ref.set(patch, { merge: true });
  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: admin.uid,
    action: 'edit_pack',
    target_id: id,
    before: existing.data() ?? null,
    after: patch,
    created_at: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ success: true, data: { updated: true } });
}

export async function DELETE(req: NextRequest) {
  const admin = await authedAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const url = req.nextUrl;
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
  }
  const ref = adminDb.collection(COLLECTIONS.POINT_PACKS).doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    return NextResponse.json({ success: false, error: 'Pack not found' }, { status: 404 });
  }
  await ref.delete();
  await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
    actor_uid: admin.uid,
    action: 'delete_pack',
    target_id: id,
    before: existing.data() ?? null,
    created_at: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
