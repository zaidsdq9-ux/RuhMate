import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
const SESSION_COOKIE_NAME = 'rm_session';

const BodySchema = z.object({
  profileId: z.string().trim().min(5).max(200),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
  }
  let reporterUid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    reporterUid = decoded.uid;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  const rl = await rateLimit(req, 'report', reporterUid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  await adminDb.collection(COLLECTIONS.REPORTS).add({
    reporter_uid: reporterUid,
    target_profile_id: parsed.data.profileId,
    reason: parsed.data.reason ?? null,
    status: 'open',
    created_at: FieldValue.serverTimestamp(),
  });
  logger.info({ reporterUid, target: parsed.data.profileId }, 'profile reported');

  return NextResponse.json({ success: true, data: { recorded: true } });
}
