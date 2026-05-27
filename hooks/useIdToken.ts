'use client';

import { useEffect, useState } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export function useIdToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      setToken(u ? await u.getIdToken() : null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { token, loading };
}
