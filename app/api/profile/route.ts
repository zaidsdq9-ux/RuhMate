import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import {
  DraftProfileSchema,
  PublishProfileSchema,
} from '@/lib/validation/profile';
import { buildProfileEmbeddingInput, hashEmbeddingInput } from '@/lib/matching/input';
import { embedText, EMBEDDING_INFO } from '@/lib/openai/embed';
import { allocateProfileIndex } from '@/lib/profile/counter';
import { serializeProfile } from '@/lib/profile/helpers';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { normalizePhoneE164 } from '@/lib/utils/phone';
import type { ProfileDoc, UserDoc } from '@/types';

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

function dobToTimestamp(dob: string): Timestamp {
  return Timestamp.fromDate(new Date(dob));
}

export async function GET(req: NextRequest) {
  const uid = await authedUid(req);
  if (typeof uid !== 'string') return uid;

  const snap = await adminDb.collection(COLLECTIONS.PROFILES).doc(uid).get();
  if (!snap.exists) {
    return NextResponse.json({ success: true, data: { profile: null } });
  }
  return NextResponse.json({
    success: true,
    data: { profile: serializeProfile(snap.data() as ProfileDoc) },
  });
}

const ActionSchema = z.object({ action: z.enum(['save_draft', 'publish']) });

export async function POST(req: NextRequest) {
  const uid = await authedUid(req);
  if (typeof uid !== 'string') return uid;

  const rl = await rateLimit(req, 'profile:write', uid);
  if (!rl.ok) return tooManyRequests(rl);

  const body = await req.json().catch(() => null);
  const actionParse = ActionSchema.safeParse(body);
  if (!actionParse.success) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid action' },
      { status: 400 },
    );
  }
  const action = actionParse.data.action;
  const payload = body?.profile ?? {};

  const schema = action === 'publish' ? PublishProfileSchema : DraftProfileSchema;
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Email-verification gate before publishing.
  if (action === 'publish') {
    const userSnap = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    const user = userSnap.data() as UserDoc | undefined;
    if (!user) {
      return NextResponse.json({ success: false, error: 'User missing' }, { status: 401 });
    }
    if (!user.email_verified) {
      return NextResponse.json(
        { success: false, error: 'Verify your email before publishing.' },
        { status: 403 },
      );
    }
    if (user.status === 'disabled') {
      return NextResponse.json({ success: false, error: 'Account disabled' }, { status: 403 });
    }
  }

  const profileRef = adminDb.collection(COLLECTIONS.PROFILES).doc(uid);
  const existingSnap = await profileRef.get();
  const existing = existingSnap.exists ? (existingSnap.data() as ProfileDoc) : null;

  const willPublish = action === 'publish';

  // Build the field patch.
  const patch: Record<string, unknown> = {
    user_id: uid,
    id: uid,
    updated_at: FieldValue.serverTimestamp(),
  };

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    // preference_text lives on the user, not the profile — handled below.
    if (key === 'preference_text') continue;
    if (key === 'date_of_birth' && typeof value === 'string') {
      patch[key] = dobToTimestamp(value);
    } else {
      patch[key] = value;
    }
  }

  // Phone verification resets when the contact number changes to a different
  // value than the one previously verified. (CLAUDE.md §4 client requirement.)
  const newPhoneNorm =
    typeof input.contact_phone === 'string' ? normalizePhoneE164(input.contact_phone) : '';
  const verifiedNorm = existing?.verified_phone_number ?? '';
  const phoneChanged = !!newPhoneNorm && !!verifiedNorm && newPhoneNorm !== verifiedNorm;
  if (phoneChanged) {
    patch.phone_verified = false;
  }

  // Phone-OTP gate before publishing. The number being published must match the
  // verified number. If not, return a machine-readable code so the client can
  // open the OTP modal instead of showing a generic error.
  if (willPublish) {
    const verifiedOk =
      existing?.phone_verified === true && !!verifiedNorm && newPhoneNorm === verifiedNorm;
    if (!verifiedOk) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your phone number before publishing your profile.',
          code: 'phone_unverified',
        },
        { status: 403 },
      );
    }
  }

  if (!existing) {
    patch.status = willPublish ? 'published' : 'draft';
    patch.created_at = FieldValue.serverTimestamp();
  } else if (willPublish) {
    patch.status = 'published';
  }

  // Embedding pipeline — runs only on publish. Two embeddings per profile lifecycle:
  //   (a) profile embedding (this profile's structured summary) — used as the "haystack"
  //       in other viewers' nearest-neighbour queries.
  //   (b) viewer preference embedding (user.preference_text) — used as the "needle"
  //       when THIS user loads their feed.
  // Both use SHA-256 input hashes so unchanged content skips the OpenAI call.
  let userPatch: Record<string, unknown> | null = null;

  if (willPublish) {
    const embeddingInputProfile = { ...existing, ...patch } as Record<string, unknown>;
    if (typeof patch.date_of_birth !== 'undefined') {
      embeddingInputProfile.date_of_birth =
        patch.date_of_birth instanceof Timestamp
          ? patch.date_of_birth.toDate()
          : patch.date_of_birth;
    }
    const text = buildProfileEmbeddingInput(embeddingInputProfile);
    const hash = hashEmbeddingInput(text);
    const previousHash = existing?.embedding_input_hash;
    if (hash !== previousHash) {
      const result = await embedText(text);
      if (result) {
        patch.embedding = result.embedding;
        patch.embedding_input_hash = hash;
        patch.last_embedded_at = FieldValue.serverTimestamp();
        logger.info({ uid, dim: result.dim, model: result.model }, 'profile embedded');
      } else {
        patch.embedding_input_hash = hash;
        logger.info({ uid, model: EMBEDDING_INFO.model }, 'profile embedding skipped (no key)');
      }
    }

    // Embed the user's free-text partner preference (stored on the user, not the profile).
    const userSnapForPref = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    const userForPref = userSnapForPref.data() as UserDoc | undefined;
    const preferenceText = (input.preference_text ?? userForPref?.preference_text ?? '').trim();
    if (preferenceText) {
      const prefHash = hashEmbeddingInput(preferenceText);
      const prevHash = userForPref?.preference_embedding_hash;
      if (prefHash !== prevHash) {
        const result = await embedText(preferenceText);
        if (result) {
          userPatch = {
            preference_text: preferenceText,
            preference_embedding: result.embedding,
            preference_embedding_hash: prefHash,
            updated_at: FieldValue.serverTimestamp(),
          };
          logger.info({ uid, dim: result.dim }, 'preference embedded');
        } else {
          userPatch = {
            preference_text: preferenceText,
            preference_embedding_hash: prefHash,
            updated_at: FieldValue.serverTimestamp(),
          };
          logger.info({ uid }, 'preference embedding skipped (no key)');
        }
      }
    }
  }

  if (!existing && willPublish) {
    // Allocate the index number atomically.
    await adminDb.runTransaction(async (tx) => {
      const indexNumber = await allocateProfileIndex(tx);
      patch.index_number = indexNumber;
      tx.set(profileRef, patch, { merge: true });
      tx.update(adminDb.collection(COLLECTIONS.USERS).doc(uid), {
        has_profile: true,
        ...(userPatch ?? {}),
        updated_at: FieldValue.serverTimestamp(),
      });
    });
  } else if (!existing && !willPublish) {
    // Draft without index — assign nothing yet.
    await profileRef.set(patch, { merge: true });
  } else {
    if (willPublish && existing && !existing.index_number) {
      // Existed as draft but no index — first publish, allocate now.
      await adminDb.runTransaction(async (tx) => {
        const indexNumber = await allocateProfileIndex(tx);
        patch.index_number = indexNumber;
        tx.set(profileRef, patch, { merge: true });
        tx.update(adminDb.collection(COLLECTIONS.USERS).doc(uid), {
          has_profile: true,
          updated_at: FieldValue.serverTimestamp(),
        });
      });
    } else {
      await profileRef.set(patch, { merge: true });
      if (willPublish && existing) {
        await adminDb
          .collection(COLLECTIONS.USERS)
          .doc(uid)
          .update({
            has_profile: true,
            ...(userPatch ?? {}),
            updated_at: FieldValue.serverTimestamp(),
          });
      }
    }
  }

  // Audit log for the publish action only — drafts are noisy.
  if (willPublish) {
    await adminDb.collection(COLLECTIONS.AUDIT_LOG).add({
      actor_uid: uid,
      action: existing?.status === 'published' ? 'publish_profile' : 'publish_profile',
      target_id: uid,
      created_at: FieldValue.serverTimestamp(),
    });
  }

  const refreshed = await profileRef.get();
  return NextResponse.json({
    success: true,
    data: { profile: serializeProfile(refreshed.data() as ProfileDoc) },
  });
}
