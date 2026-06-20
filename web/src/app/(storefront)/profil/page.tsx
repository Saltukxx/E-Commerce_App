'use client';

import Link from 'next/link';
import { logout } from '@/lib/api-client';
import { useAuthStore, getRoleHome } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  if (!user) {
    return <PageHeader title="Profil" subtitle="Bitte melden Sie sich an." />;
  }

  const panelHref = user.role === 'admin' || user.role === 'vendor' ? getRoleHome(user.role) : null;
  const panelLabel = user.role === 'admin' ? 'Admin Panel' : user.role === 'vendor' ? 'Händlerportal' : null;

  return (
    <div className="max-w-lg">
      <PageHeader title="Profil" />
      <div className="rounded-2xl border bg-white p-6">
        <p className="font-semibold text-[#001529]">{user.name}</p>
        <p className="text-gray-600">{user.email}</p>
        <p className="mt-2 text-sm text-gray-500">Rolle: {user.role}</p>
        {panelHref && panelLabel ? (
          <Link
            href={panelHref}
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#001529] px-4 text-sm font-semibold text-white hover:bg-[#002a45]"
          >
            {panelLabel}
          </Link>
        ) : null}
        <Button className="mt-4" variant="secondary" onClick={handleLogout}>
          Abmelden
        </Button>
      </div>
    </div>
  );
}
