'use client';

import { useState } from 'react';

interface Props {
  title: string;
  description: string;
  confirmWord?: string;
  confirmLabel?: string;
  busyLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ConfirmDeleteModal({
  title,
  description,
  confirmWord = 'DELETE',
  confirmLabel = 'Delete',
  busyLabel = 'Deleting…',
  onConfirm,
  onClose,
}: Props) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canConfirm = input === confirmWord;

  async function handleConfirm() {
    if (!canConfirm || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={() => !busy && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-red-700">{title}</h2>
        <p className="mt-2 text-sm text-ink-muted">{description}</p>

        <div className="mt-4">
          <label
            htmlFor="confirm-delete-input"
            className="mb-1.5 block text-xs font-medium text-ink-muted"
          >
            Type <strong className="text-ink">{confirmWord}</strong> to confirm
          </label>
          <input
            id="confirm-delete-input"
            className="focus-ring h-10 w-full rounded-btn border border-line bg-white px-3 text-sm text-ink"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder={confirmWord}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleConfirm}
            disabled={!canConfirm || busy}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
