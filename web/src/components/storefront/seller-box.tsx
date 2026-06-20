import Link from 'next/link';
import Image from 'next/image';
import type { Store } from '@/lib/types';
import { TrustBadges } from '@/components/storefront/trust-badges';
import { storeLogoPath } from '@/lib/mobile-assets';
import { resolveImageUrl } from '@/lib/utils';

export function SellerBox({ store }: { store: Store }) {
  return (
    <div className="mt-6 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--db-muted)]">
        Verkauft von
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--db-border)] bg-white">
          <Image
            src={store.logo ? resolveImageUrl(store.logo) : storeLogoPath(store.slug)}
            alt={store.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="min-w-0">
          <Link
            href={`/shop/${store.slug}`}
            className="font-semibold text-[var(--db-primary)] hover:underline"
          >
            {store.name}
          </Link>
          {store.deliveryArea ? (
            <p className="mt-0.5 truncate text-sm text-[var(--db-muted)]">{store.deliveryArea}</p>
          ) : null}
        </div>
      </div>
      <TrustBadges store={store} className="mt-3" />
    </div>
  );
}
