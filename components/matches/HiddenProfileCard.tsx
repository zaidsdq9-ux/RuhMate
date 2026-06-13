'use client';

// Card used inside the Hidden tab — same surface as ProfileCard but with an
// inline "Restore" button that DELETEs the profile_actions doc and removes
// the card from the list optimistically.

import Link from 'next/link';
import { useState } from 'react';
import { Portrait } from '@/components/ui/Portrait';
import { Icon } from '@/components/ui/icons';
import type { FeedCardProfile } from '@/components/feed/ProfileCard';

function maritalLabel(s: string): string {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function HiddenProfileCard({ profile }: { profile: FeedCardProfile }) {
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function restore() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/profile-action?target_index_number=${profile.index_number}`,
        { method: 'DELETE' },
      );
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error ?? `Restore failed (${res.status})`);
        setBusy(false);
        return;
      }
      setRemoved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setBusy(false);
    }
  }

  if (removed) return null;

  return (
    <div className="card flex h-full flex-col overflow-hidden p-0">
      <div className="px-5 pt-5">
        <Portrait idx={profile.index_number} size={56} gender={profile.gender} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-rose-deep px-3 py-1 text-sm font-semibold leading-none tracking-tight text-white tabular-nums">
            #{profile.index_number}
          </span>
          <span className="text-sm text-ink-soft">
            {profile.age != null ? `${profile.age} yrs` : '—'}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Icon.Pin />
            {profile.current_city || profile.district || '—'}
          </span>
          {profile.country && <span>· {profile.country}</span>}
        </div>
        <p
          className="mt-3 text-[13px] leading-[1.5] text-ink-soft"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {profile.about_me || '—'}
        </p>
        <div className="mt-3 text-[11px] text-ink-muted">
          {maritalLabel(profile.marital_status)}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-line bg-surface-alt px-5 py-3">
        <Link
          href={`/profile/${profile.index_number}`}
          className="btn btn-ghost btn-sm flex-1 justify-center"
        >
          View
        </Link>
        <button
          type="button"
          onClick={restore}
          disabled={busy}
          className="btn btn-outline btn-sm flex-1 justify-center"
        >
          {busy ? 'Restoring…' : 'Restore'}
        </button>
      </div>
      {error && (
        <div className="border-t border-line bg-rose-soft px-5 py-2 text-[11.5px] text-rose-deep">
          {error}
        </div>
      )}
    </div>
  );
}
