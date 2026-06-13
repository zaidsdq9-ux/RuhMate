// Viewer-curated state for a profile: 'shortlist' (right-swiped) or 'hidden'
// (left-swiped). One doc per (viewer, target). Idempotent — POSTing the same
// action again just refreshes the timestamp; POSTing the opposite kind swaps
// it. DELETE removes the doc.
//
// Doc id format: `{viewer_uid}_{target_profile_id}` — same pattern as unlocks.

import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const SESSION_COOKIE_NAME = 'rm_session';

const KindSchema = z.enum(['shortlist', 'hidden']);

const PostSchema = z.object({
  target_index_number: z.coerce.number().int().positive(),
  kind: KindSchema,
});

const DeleteSchema = z.object({
  target_index_number: z.coerce.number().int().positive(),
});

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

async function profileIdByIndex(indexNumber: number): Promise<string | null> {
  const snap = await adminDb
    .collection(COLLECTIONS.PROFILES)
    .where('index_number', '==', indexNumber)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0]!.id;
}

export async function POST(req: NextRequest) {
  const uid = await authedUid(req);
  if (typeof uid !== 'string') return uid;

  const rl = await rateLimit(req, 'profile:write', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }
  const { target_index_number, kind } = parsed.data;

  const targetProfileId = await profileIdByIndex(target_index_number);
  if (!targetProfileId) {
    return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
  }
  if (targetProfileId === uid) {
    return NextResponse.json(
      { success: false, error: 'Cannot action your own profile' },
      { status: 400 },
    );
  }

  const docId = `${uid}_${targetProfileId}`;
  await adminDb
    .collection(COLLECTIONS.PROFILE_ACTIONS)
    .doc(docId)
    .set(
      {
        viewer_uid: uid,
        target_profile_id: targetProfileId,
        target_index_number,
        kind,
        acted_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  logger.info({ uid, target_index_number, kind }, 'profile action saved');
  return NextResponse.json({ success: true, data: { kind, target_index_number } });
}

export async function DELETE(req: NextRequest) {
  const uid = await authedUid(req);
  if (typeof uid !== 'string') return uid;

  const rl = await rateLimit(req, 'profile:write', uid);
  if (!rl.ok) return tooManyRequests(rl);

  // Accept identifier from query OR body so the client can use either.
  const url = new URL(req.url);
  const queryIndex = url.searchParams.get('target_index_number');
  const body = queryIndex
    ? { target_index_number: queryIndex }
    : await req.json().catch(() => null);
  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 },
    );
  }

  const targetProfileId = await profileIdByIndex(parsed.data.target_index_number);
  if (!targetProfileId) {
    return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
  }
  const docId = `${uid}_${targetProfileId}`;
  await adminDb.collection(COLLECTIONS.PROFILE_ACTIONS).doc(docId).delete();
  return NextResponse.json({ success: true, data: { target_index_number: parsed.data.target_index_number } });
}

