'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { getRoleHome } from '@/lib/auth-store';

export function RequireRole({
  role,
  children,
}: {
  role: 'admin' | 'vendor' | 'customer';
  children: React.ReactNode;
}) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [checking, setChecking] = useState(Boolean(accessToken && !user));

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/anmelden?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (user) {
      if (user.role !== role) {
        router.replace(getRoleHome(user.role));
      }
      return;
    }
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile.role !== role) {
          router.replace(getRoleHome(profile.role));
        }
      })
      .catch(() => {
        if (!cancelled) router.replace(`/anmelden?next=${encodeURIComponent(window.location.pathname)}`);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, user, role, router]);

  if (!accessToken || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9] text-sm text-gray-500">
        Wird geladen…
      </div>
    );
  }

  if (user && user.role !== role) {
    return null;
  }

  return <>{children}</>;
}
