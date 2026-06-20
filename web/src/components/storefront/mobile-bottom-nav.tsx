'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Start', icon: Home, match: (path: string) => path === '/' },
  {
    href: '/katalog',
    label: 'Katalog',
    icon: LayoutGrid,
    match: (path: string) => path.startsWith('/katalog') || path.startsWith('/produkt'),
  },
  { href: '/warenkorb', label: 'Warenkorb', icon: ShoppingCart, match: (path: string) => path === '/warenkorb' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const profileHref = user ? '/profil' : '/anmelden';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--db-border)] bg-[var(--db-surface)]/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-[56px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition',
                active ? 'text-[var(--db-primary)]' : 'text-[var(--db-muted)]',
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} aria-hidden />
              {label}
            </Link>
          );
        })}
        <Link
          href={profileHref}
          className={cn(
            'flex min-h-[56px] min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition',
            pathname === profileHref || pathname === '/anmelden'
              ? 'text-[var(--db-primary)]'
              : 'text-[var(--db-muted)]',
          )}
        >
          <User className="h-5 w-5" aria-hidden />
          Profil
        </Link>
      </div>
    </nav>
  );
}
