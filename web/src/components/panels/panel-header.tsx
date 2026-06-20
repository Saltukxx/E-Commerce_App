'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { logout } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui';

export function PanelHeader({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/anmelden');
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        <span className="font-[family-name:var(--font-plus-jakarta)] text-lg font-bold text-[#001529]">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xs text-gray-500 hover:text-[#001529]">
          Shop
        </Link>
        <Button size="sm" variant="ghost" onClick={handleLogout} aria-label="Abmelden">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export function PanelUserFooter() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/anmelden');
  }

  if (!user) return null;

  return (
    <div className="mt-auto border-t border-gray-200 pt-4">
      <p className="truncate text-sm font-medium text-[#001529]">{user.name}</p>
      <p className="truncate text-xs text-gray-500">{user.email}</p>
      <div className="mt-3 flex flex-col gap-1">
        <Link href="/" className="text-xs text-gray-600 hover:text-[#001529]">
          Zum Shop
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-left text-xs text-gray-600 hover:text-red-700"
        >
          <LogOut className="h-3.5 w-3.5" />
          Abmelden
        </button>
      </div>
    </div>
  );
}
