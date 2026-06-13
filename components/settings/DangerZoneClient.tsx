'use client';

import { useState } from 'react';
import { SectionHeading } from '@/components/ui/section';

export function DangerZoneClient() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canConfirm = input === 'DELETE';

  async function handleDelete() {
    if (!canConfirm || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      const data: { success: boolean; error?: string } = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Deletion failed. Please try again.');
        setLoading(false);
        return;
      }
      // Server cleared the session cookie — full navigation wipes all client state
      window.location.href = '/';
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setInput('');
    setError('');
  }

  return (
    <>
      <div className="card p-7" style={{ borderColor: 'rgba(184,52,90,0.25)' }}>
        <SectionHeading
          title="Danger zone"
          subtitle="These actions can't be easily undone"
        />
        <div className="flex flex-col gap-2.5">
          {/* Pause profile */}
          <div
            className="flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: 'rgba(184,52,90,0.05)',
              border: '1px solid rgba(184,52,90,0.15)',
            }}
          >
            <div>
              <div className="text-sm font-medium">Pause profile</div>
              <div className="text-xs text-ink-muted">
                Hide from feed without deleting. Reactivate any time.
              </div>
            </div>
            <button type="button" className="btn btn-outline btn-sm w-full sm:w-auto" disabled>
              Pause
            </button>
          </div>

          {/* Delete account */}
          <div
            className="flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: 'rgba(184,52,90,0.05)',
              border: '1px solid rgba(184,52,90,0.15)',
            }}
          >
            <div>
              <div className="text-sm font-medium text-danger">Delete account</div>
              <div className="text-xs text-ink-muted">
                Permanent. All profile data and unlocks are removed.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm w-full sm:w-auto"
              onClick={() => setOpen(true)}
            >
              Delete
            </button>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-ink-muted">
          Need help?{' '}
          <a href="mailto:support@ruhmate.lk" className="text-rose-deep underline">
            Contact support@ruhmate.lk
          </a>
        </p>
      </div>

      {/* Confirmation modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-danger">Delete your account?</h2>
            <p className="mt-2 text-sm text-ink-muted">
              This will <strong className="text-ink">permanently</strong> remove your profile,
              preferences, matches, contact unlocks, and all account data. This action{' '}
              <strong className="text-ink">cannot be undone</strong>. You will be logged out
              immediately after.
            </p>

            <div className="mt-4">
              <label
                htmlFor="delete-confirm-input"
                className="mb-1.5 block text-xs font-medium text-ink-muted"
              >
                Type <strong className="text-ink">DELETE</strong> to confirm
              </label>
              <input
                id="delete-confirm-input"
                className="input w-full"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="DELETE"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {error && <p className="mt-2 text-xs text-danger">{error}</p>}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={!canConfirm || loading}
              >
                {loading ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
