'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/utils';
import type { StoreSummary } from '@/lib/types';
import { storeLogoPath } from '@/lib/mobile-assets';

export function SellerLine({
  store,
  compact = false,
}: {
  store: StoreSummary;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-1.5 ${compact ? 'mt-1.5' : 'mt-2'}`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full border border-[var(--db-border)] bg-white">
        <Image
          src={store.logo ? resolveImageUrl(store.logo) : storeLogoPath(store.slug)}
          alt=""
          fill
          className="object-cover"
          sizes="16px"
        />
      </div>
      <p className={`min-w-0 truncate text-[var(--db-muted)] ${compact ? 'text-[10px]' : 'text-xs'}`}>
        Verkauft von{' '}
        <Link
          href={`/shop/${store.slug}`}
          className="font-semibold text-[var(--db-primary)] hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {store.name}
        </Link>
      </p>
    </div>
  );
}
