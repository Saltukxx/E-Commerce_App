'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { vendorStore } from '@/lib/panel-api';
import { resolveImageUrl } from '@/lib/utils';
import { StatusBadge } from '@/components/panels/status-badge';

export function VendorHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data } = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const store = data?.data;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--db-border)] bg-[var(--db-surface)]/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-lg p-2 text-[var(--db-muted)] hover:bg-[var(--db-accent)]"
              aria-label="Menü öffnen"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-plus-jakarta)] text-sm font-bold text-[var(--db-primary)]">
              {store?.name ?? 'Händlerportal'}
            </p>
            {store?.status ? (
              <StatusBadge status={store.status} kind="store" />
            ) : null}
          </div>
        </div>
        {store?.slug ? (
          <Link
            href={`/shop/${store.slug}`}
            className="flex shrink-0 items-center gap-1 text-xs text-[var(--db-muted)] hover:text-[var(--db-primary)]"
          >
            Shop
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function VendorDesktopBar() {
  const { data } = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const store = data?.data;

  if (!store) return null;

  return (
    <div className="mb-6 hidden items-center justify-between gap-4 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 md:flex">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--db-border)] bg-[var(--db-accent)]">
          {store.logo ? (
            <Image src={resolveImageUrl(store.logo)} alt="" fill className="object-cover" sizes="48px" />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-plus-jakarta)] text-lg font-bold text-[var(--db-primary)]">
            {store.name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={store.status} kind="store" />
            <span className="text-xs text-[var(--db-muted)]">/{store.slug}</span>
          </div>
        </div>
      </div>
      <Link
        href={`/shop/${store.slug}`}
        className="db-btn db-btn-secondary inline-flex items-center gap-2 text-sm"
      >
        Shop ansehen
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  );
}
