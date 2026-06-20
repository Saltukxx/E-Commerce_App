'use client';

import { useEffect, useState } from 'react';
import { fetchProfile } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [ready, setReady] = useState(!accessToken);

  useEffect(() => {
    if (!accessToken) {
      setReady(true);
      return;
    }
    if (user) {
      setReady(true);
      return;
    }
    let cancelled = false;
    fetchProfile()
      .catch(() => {
        useAuthStore.getState().clearSession();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, user]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9] text-sm text-gray-500">
        Wird geladen…
      </div>
    );
  }

  return <>{children}</>;
}
