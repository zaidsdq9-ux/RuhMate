'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface Props {
  uid: string;
  label: string;
  variant?: 'link' | 'button';
  redirectTo?: string;
}

export function DeleteUserButton({ uid, label, variant = 'button', redirectTo }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    const res = await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      throw new Error(json.error ?? 'Deletion failed.');
    }
    setOpen(false);
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <>
      {variant === 'link' ? (
        <button
          type="button"
          className="text-xs font-medium text-red-600 hover:underline"
          onClick={() => setOpen(true)}
        >
          Delete
        </button>
      ) : (
        <button type="button" className="btn btn-danger btn-sm" onClick={() => setOpen(true)}>
          Delete account
        </button>
      )}
      {open && (
        <ConfirmDeleteModal
          title={`Delete ${label}?`}
          description="This permanently removes their login, profile, unlocks, transactions, and every other record tied to this account. This cannot be undone — if they sign up again, it will be a brand-new account."
          onConfirm={handleConfirm}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
