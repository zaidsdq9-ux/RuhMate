'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icons';
import { formatSriLankanPhoneForDisplay, normalizeSriLankanPhone } from '@/lib/utils/phone';

const RESEND_COOLDOWN_SECONDS = 60;

interface Props {
  /** Raw contact phone from the form. Normalised to Text.lk format for sending. */
  phoneRaw: string;
  /** Confirm-button label: "Verify" (standalone) or "Verify & Publish" (publish gate). */
  actionLabel?: string;
  /** Called after the backend has recorded the verification. */
  onVerified: () => void;
  onClose: () => void;
}

type Step = 'enter' | 'sending' | 'code' | 'verifying';

export function PhoneVerifyModal({ phoneRaw, actionLabel = 'Verify', onVerified, onClose }: Props) {
  const norm = normalizeSriLankanPhone(phoneRaw);
  const valid = norm.ok && !!norm.value;
  const displayNumber = valid ? formatSriLankanPhoneForDisplay(norm.value!) : phoneRaw || '—';

  const [step, setStep] = useState<Step>('enter');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  function startCooldown(seconds: number) {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSend() {
    setError(null);
    if (!valid || !norm.value) {
      setError(norm.error ?? 'Enter a valid Sri Lankan mobile number.');
      return;
    }
    setStep('sending');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: norm.value, purpose: 'profile_phone_verification' }),
      });
      const body = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { alreadyVerified?: boolean };
      };
      if (!res.ok || !body.success) {
        setError(body.error ?? 'Could not send the verification code. Please try again.');
        setStep('enter');
        return;
      }
      if (body.data?.alreadyVerified) {
        onVerified();
        return;
      }
      setStep('code');
      startCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError('Could not send the verification code. Please try again.');
      setStep('enter');
    }
  }

  async function handleVerify() {
    setError(null);
    if (!norm.value) return;
    if (code.trim().length !== 6) {
      setError('Enter the 6-digit code from the SMS.');
      return;
    }
    setStep('verifying');
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: norm.value,
          otp: code.trim(),
          purpose: 'profile_phone_verification',
        }),
      });
      const body = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !body.success) {
        setError(body.error ?? 'Invalid code. Please try again.');
        setStep('code');
        return;
      }
      onVerified();
    } catch {
      setError('Verification failed. Please try again.');
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
          one-time code to <strong className="text-ink">{displayNumber}</strong>.
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
                disabled={step === 'verifying' || cooldown > 0}
                className="text-[13px] font-medium text-rose-deep hover:underline disabled:cursor-not-allowed disabled:text-ink-faint disabled:no-underline"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
            </>
          )}

          {error && (
            <div className="rounded-card border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
