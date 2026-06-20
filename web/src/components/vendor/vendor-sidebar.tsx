'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PanelUserFooter } from '@/components/panels/panel-header';
import { vendorNavLinks } from './vendor-nav';

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--db-border)] bg-[var(--db-surface)] p-6 md:flex">
      <Link
        href="/vendor/dashboard"
        className="mb-2 block font-[family-name:var(--font-plus-jakarta)] text-lg font-bold text-[var(--db-primary)]"
      >
        Händlerportal
      </Link>
      <p className="mb-8 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--db-muted)]">
        DurmusBaba Marktplatz
      </p>
      <nav className="flex flex-1 flex-col space-y-1">
        {vendorNavLinks.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== '/vendor/dashboard' && href !== '/vendor/products/import' && pathname.startsWith(href)) ||
            (href === '/vendor/products' &&
              pathname.startsWith('/vendor/products') &&
              !pathname.startsWith('/vendor/products/import'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                active
                  ? 'bg-[var(--db-accent)] font-semibold text-[var(--db-primary)]'
                  : 'text-[var(--db-muted)] hover:bg-[var(--db-accent)]/50 hover:text-[var(--db-primary)]',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <PanelUserFooter />
    </aside>
  );
}
