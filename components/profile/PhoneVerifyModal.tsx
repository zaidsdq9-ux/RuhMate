'use client';

import { useEffect, useRef, useState } from 'react';
import type { ConfirmationResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icons';
import { sendPhoneOtp, confirmPhoneOtp, clearRecaptcha } from '@/lib/firebase/phone-auth';
import { normalizePhoneE164, isLikelyE164 } from '@/lib/utils/phone';

interface Props {
  /** Raw contact phone from the form. Normalised to E.164 for sending. */
  phoneRaw: string;
  /** Confirm-button label: "Verify" (standalone) or "Verify & Publish" (publish gate). */
  actionLabel?: string;
  /** Called after the backend has recorded the verification. */
  onVerified: () => void;
  onClose: () => void;
}

type Step = 'enter' | 'sending' | 'code' | 'verifying';

const RECAPTCHA_ID = 'otp-recaptcha-container';

export function PhoneVerifyModal({ phoneRaw, actionLabel = 'Verify', onVerified, onClose }: Props) {
  const e164 = normalizePhoneE164(phoneRaw);
  const valid = isLikelyE164(e164);

  const [step, setStep] = useState<Step>('enter');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // Tidy up the reCAPTCHA widget when the modal unmounts.
  useEffect(() => () => clearRecaptcha(), []);

  async function handleSend() {
    setError(null);
    if (!valid) {
      setError('Enter a valid phone number in the Contact section first.');
      return;
    }
    setStep('sending');
    try {
      confirmationRef.current = await sendPhoneOtp(e164, RECAPTCHA_ID);
      setStep('code');
    } catch (err) {
      setError(messageFor(err, 'Could not send the code. Check the number and try again.'));
      setStep('enter');
      clearRecaptcha();
    }
  }

  async function handleVerify() {
    setError(null);
    if (!confirmationRef.current) {
      setError('Please request a code first.');
      return;
    }
    if (code.trim().length < 6) {
      setError('Enter the 6-digit code from the SMS.');
      return;
    }
    setStep('verifying');
    try {
      const token = await confirmPhoneOtp(confirmationRef.current, code.trim());
      const res = await fetch('/api/profile/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !body.success) {
        setError(body.error ?? 'Verification failed. Please try again.');
        setStep('code');
        return;
      }
      onVerified();
    } catch (err) {
      setError(messageFor(err, 'That code did not match. Please try again.'));
      setStep('code');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Verify your phone number"
    >
      <div className="card w-full max-w-md p-6 shadow-pop">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2 className="display text-xl text-ink">Verify your phone number</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-pill p-1 text-ink-muted hover:bg-rose-bg hover:text-rose-deep"
            aria-label="Close"
          >
            <Icon.Close size={18} />
          </button>
        </div>
        <p className="text-sm leading-[1.55] text-ink-soft">
          Please verify your phone number before publishing your profile. We&apos;ll text a
          one-time code to{' '}
          <strong className="text-ink">{valid ? e164 : phoneRaw || '—'}</strong>.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {step !== 'code' && step !== 'verifying' ? (
            <Button type="button" onClick={handleSend} disabled={step === 'sending' || !valid}>
              {step === 'sending' ? 'Sending…' : 'Send OTP'}
            </Button>
          ) : (
            <>
              <div className="grid gap-1.5">
                <label htmlFor="otp-code" className="label">
                  Enter OTP
                </label>
                <Input
                  id="otp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                />
              </div>
              <Button type="button" onClick={handleVerify} disabled={step === 'verifying'}>
                {step === 'verifying' ? 'Verifying…' : actionLabel}
              </Button>
              <button
                type="button"
                onClick={handleSend}
                disabled={step === 'verifying'}
                className="text-[13px] font-medium text-rose-deep hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </>
          )}

          {error && (
            <div className="rounded-card border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Invisible reCAPTCHA mounts here (required by Firebase phone auth). */}
        <div id={RECAPTCHA_ID} />
      </div>
    </div>
  );
}

function messageFor(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code: unknown }).code);
    if (code.includes('invalid-phone-number')) return 'That phone number is not valid.';
    if (code.includes('invalid-verification-code')) return 'That code did not match. Please try again.';
    if (code.includes('too-many-requests')) return 'Too many attempts. Please wait a few minutes.';
    if (code.includes('code-expired')) return 'The code expired. Please request a new one.';
    if (code.includes('captcha')) return 'reCAPTCHA check failed. Please try again.';
    if (code.includes('billing-not-enabled'))
      return 'SMS to real numbers needs the Firebase Blaze plan. (Test numbers work on the free plan.)';
    if (code.includes('quota-exceeded')) return 'Daily SMS limit reached. Please try again later.';
    if (code.includes('operation-not-allowed'))
      return 'Phone sign-in is not enabled for this project.';
  }
  return fallback;
}
