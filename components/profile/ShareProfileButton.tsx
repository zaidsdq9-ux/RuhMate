'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icons';

interface Props {
  /** Profile index number — used only for the share title/text. */
  indexNumber: number;
}

/**
 * Share / copy-link control for the profile detail page.
 * - Mobile (and any browser exposing the Web Share API): native share sheet.
 * - Desktop / no Web Share: copy the current URL to the clipboard.
 * Shows a transient "Profile link copied" confirmation either way.
 */
export function ShareProfileButton({ indexNumber }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flash = useCallback(() => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  }, []);

  const copyToClipboard = useCallback(async (url: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      }
    } catch {
      // fall through to legacy path
    }
    try {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const shareData = {
      title: `RuhMate — Profile #${indexNumber}`,
      text: `Have a look at Profile #${indexNumber} on RuhMate.`,
      url,
    };

    // Prefer the native share sheet where available (mobile).
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled the sheet — do nothing. Any other error → copy fallback.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    if (await copyToClipboard(url)) flash();
  }, [indexNumber, copyToClipboard, flash]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn btn-outline btn-sm"
      aria-live="polite"
    >
      {copied ? (
        <>
          <Icon.Check size={14} />
          Profile link copied
        </>
      ) : (
        <>
          <Icon.Share size={15} />
          Share profile
        </>
      )}
    </button>
  );
}
