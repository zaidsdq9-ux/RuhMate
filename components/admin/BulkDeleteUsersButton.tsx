'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface BulkResult {
  deleted: number;
  skipped_admins: number;
  failed: number;
}

export function BulkDeleteUsersButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);

  async function handleConfirm() {
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'DELETE_ALL_ACCOUNTS' }),
    });
    const json = (await res.json()) as { success: boolean; error?: string; data?: BulkResult };
    if (!res.ok || !json.success) {
      throw new Error(json.error ?? 'Bulk deletion failed.');
    }
    setResult(json.data ?? null);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" className="btn btn-danger btn-sm" onClick={() => setOpen(true)}>
        Delete all accounts
      </button>
      {result && (
        <p className="text-xs text-ink-muted">
          Deleted {result.deleted}, skipped {result.skipped_admins} admin
          {result.skipped_admins === 1 ? '' : 's'}
          {result.failed > 0 ? `, ${result.failed} failed (see logs)` : ''}.
        </p>
      )}
      {open && (
        <ConfirmDeleteModal
          title="Delete every non-admin account?"
          description="This permanently removes the login, profile, and all data for every account on the platform except admin accounts. This cannot be undone — anyone deleted will need to sign up as a brand-new account."
          confirmWord="DELETE ALL"
          confirmLabel="Delete all"
          busyLabel="Deleting all…"
          onConfirm={handleConfirm}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
