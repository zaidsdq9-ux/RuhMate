import { randomInt, createHmac, timingSafeEqual } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { logger } from '@/lib/logger';
import { sendTextLKSMS } from '@/lib/textlk';
import type { OtpDoc, OtpPurpose } from '@/types';

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

function otpDocId(uid: string, purpose: OtpPurpose): string {
  return `${uid}_${purpose}`;
}

function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

function hashOtp(code: string, uid: string, purpose: OtpPurpose, phone: string): string {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret) throw new Error('OTP_HASH_SECRET not configured');
  return createHmac('sha256', secret).update(`${uid}:${purpose}:${phone}:${code}`).digest('hex');
}

function timingSafeHexEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return '***';
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

export class OtpCooldownError extends Error {
  constructor(public retryAfterSec: number) {
    super('OTP_COOLDOWN_ACTIVE');
  }
}

/**
 * Generate, hash, store, and send a fresh OTP for (uid, purpose). Overwrites
 * any previous pending code for the same user + purpose — only one code can
 * be outstanding at a time. The Firestore record is only written AFTER a
 * successful Text.lk send, so a failed send never starts the resend cooldown.
 */
export async function requestOtp(uid: string, phone: string, purpose: OtpPurpose): Promise<void> {
  const ref = adminDb.collection(COLLECTIONS.OTP_CODES).doc(otpDocId(uid, purpose));
  const snap = await ref.get();
  const existing = snap.exists ? (snap.data() as OtpDoc) : null;

  if (existing?.last_sent_at) {
    const elapsedSec = (Date.now() - existing.last_sent_at.toMillis()) / 1000;
    if (elapsedSec < OTP_RESEND_COOLDOWN_SECONDS) {
      throw new OtpCooldownError(Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsedSec));
    }
  }

  const code = generateOtp();
  const otpHash = hashOtp(code, uid, purpose, phone);
  const message = `Your Ruhmate verification code is ${code}. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`;

  const { messageId } = await sendTextLKSMS({ recipient: phone, message });

  const now = Timestamp.now();
  const record: OtpDoc = {
    id: ref.id,
    user_id: uid,
    phone_normalized: phone,
    purpose,
    otp_hash: otpHash,
    expires_at: Timestamp.fromMillis(now.toMillis() + OTP_EXPIRY_MINUTES * 60_000),
    attempts: 0,
    max_attempts: OTP_MAX_ATTEMPTS,
    last_sent_at: now,
    created_at: now,
    updated_at: now,
    textlk_message_id: messageId,
    status: 'pending',
  };

  // Full overwrite (not merge) — invalidates any prior pending code for this purpose.
  await ref.set(record);

  logger.info({ uid, purpose, phone: maskPhone(phone), messageId }, 'otp: code sent');
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'too_many_attempts' | 'invalid' };

/**
 * Verify a submitted code for (uid, purpose). Runs inside a transaction so
 * concurrent verify attempts can't race past the attempt-count guard.
 */
export async function verifyOtp(
  uid: string,
  phone: string,
  code: string,
  purpose: OtpPurpose,
): Promise<VerifyOtpResult> {
  const ref = adminDb.collection(COLLECTIONS.OTP_CODES).doc(otpDocId(uid, purpose));

  return adminDb.runTransaction(async (tx): Promise<VerifyOtpResult> => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      logger.warn({ uid, purpose, phone: maskPhone(phone) }, 'otp: verify failed (not found)');
      return { ok: false, reason: 'not_found' };
    }
    const data = snap.data() as OtpDoc;

    if (data.status !== 'pending' || data.phone_normalized !== phone) {
      logger.warn(
        { uid, purpose, phone: maskPhone(phone), status: data.status },
        'otp: verify failed (stale or phone mismatch)',
      );
      return { ok: false, reason: 'not_found' };
    }

    if (data.expires_at.toMillis() < Date.now()) {
      tx.set(ref, { status: 'expired', updated_at: FieldValue.serverTimestamp() }, { merge: true });
      logger.warn({ uid, purpose, phone: maskPhone(phone) }, 'otp: verify failed (expired)');
      return { ok: false, reason: 'expired' };
    }

    if (data.attempts >= data.max_attempts) {
      tx.set(ref, { status: 'failed', updated_at: FieldValue.serverTimestamp() }, { merge: true });
      logger.warn({ uid, purpose, phone: maskPhone(phone) }, 'otp: verify failed (max attempts)');
      return { ok: false, reason: 'too_many_attempts' };
    }

    const submittedHash = hashOtp(code, uid, purpose, phone);
    if (!timingSafeHexEqual(submittedHash, data.otp_hash)) {
      const attempts = data.attempts + 1;
      const maxedOut = attempts >= data.max_attempts;
      tx.set(
        ref,
        { attempts, status: maxedOut ? 'failed' : 'pending', updated_at: FieldValue.serverTimestamp() },
        { merge: true },
      );
      logger.warn({ uid, purpose, phone: maskPhone(phone), attempts }, 'otp: verify failed (mismatch)');
      return { ok: false, reason: maxedOut ? 'too_many_attempts' : 'invalid' };
    }

    tx.set(
      ref,
      {
        status: 'verified',
        verified_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    logger.info({ uid, purpose, phone: maskPhone(phone) }, 'otp: verified');
    return { ok: true };
  });
}
