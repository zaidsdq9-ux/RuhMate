'use client';

/**
 * Phone-number OTP verification, isolated from the main email/password session.
 *
 * We run phone auth on a SECONDARY Firebase app instance ("ruhmate-otp") so the
 * SMS sign-in never replaces the user's existing email session on the default
 * app. After the code is confirmed we read the phone-auth ID token (its
 * `phone_number` claim proves ownership), hand it to our backend, then sign the
 * throwaway phone session out.
 *
 * Requires Firebase Console → Authentication → Phone provider enabled, and the
 * deploy domain added under Authentication → Settings → Authorized domains.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const OTP_APP_NAME = 'ruhmate-otp';

function getOtpAuth(): Auth {
  const existing = getApps().find((a) => a.name === OTP_APP_NAME);
  const app: FirebaseApp = existing ?? initializeApp(firebaseConfig, OTP_APP_NAME);
  return getAuth(app);
}

let verifier: RecaptchaVerifier | null = null;

/** Tear down any rendered reCAPTCHA so a fresh one can mount on the next send. */
export function clearRecaptcha() {
  if (verifier) {
    try {
      verifier.clear();
    } catch {
      // ignore
    }
    verifier = null;
  }
}

/**
 * Send an OTP to the given E.164 number. `containerId` is the id of an empty
 * div the invisible reCAPTCHA can attach to.
 */
export async function sendPhoneOtp(
  e164: string,
  containerId: string,
): Promise<ConfirmationResult> {
  const auth = getOtpAuth();
  clearRecaptcha();
  verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  return signInWithPhoneNumber(auth, e164, verifier);
}

/**
 * Confirm the SMS code. Returns the phone-auth ID token for the backend to
 * verify. Signs the throwaway phone session out afterwards.
 */
export async function confirmPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<string> {
  const cred = await confirmation.confirm(code);
  const token = await cred.user.getIdToken();
  try {
    await getOtpAuth().signOut();
  } catch {
    // ignore — token is already minted
  }
  clearRecaptcha();
  return token;
}
