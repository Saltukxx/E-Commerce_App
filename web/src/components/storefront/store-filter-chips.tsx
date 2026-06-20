import Link from 'next/link';
import type { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

function buildHref(storeSlug?: string) {
  const params = new URLSearchParams();
  if (storeSlug) params.set('storeSlug', storeSlug);
  const qs = params.toString();
  return qs ? `/katalog?${qs}` : '/katalog';
}

const activeClasses =
  'bg-[var(--db-accent)] font-semibold text-[var(--db-primary)] ring-1 ring-[var(--db-primary)]/20';
const inactiveClasses = 'bg-[var(--db-surface)] text-gray-700 ring-1 ring-[var(--db-border)]';

export function StoreFilterChips({
  stores,
  activeStoreSlug,
  query,
  categoryId,
}: {
  stores: Store[];
  activeStoreSlug?: string;
  query?: string;
  categoryId?: string;
}) {
  function hrefFor(storeSlug?: string) {
    const params = new URLSearchParams();
    if (query?.trim()) params.set('q', query.trim());
    if (categoryId) params.set('categoryId', categoryId);
    if (storeSlug) params.set('storeSlug', storeSlug);
    const qs = params.toString();
    return qs ? `/katalog?${qs}` : '/katalog';
  }

  return (
    <div className="scrollbar-hide flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-0.5">
      <Link
        href={hrefFor()}
        className={cn(
          'shrink-0 snap-start rounded-full px-3 py-1.5 text-xs transition',
          !activeStoreSlug ? activeClasses : inactiveClasses,
        )}
      >
        Alle Händler
      </Link>
      {stores.map((store) => {
        const active = activeStoreSlug === store.slug;
        return (
          <Link
            key={store.id}
            href={hrefFor(store.slug)}
            className={cn(
              'max-w-[160px] shrink-0 snap-start truncate rounded-full px-3 py-1.5 text-xs transition',
              active ? activeClasses : inactiveClasses,
            )}
          >
            {store.name}
          </Link>
        );
      })}
    </div>
  );
}

export { buildHref as buildStoreCatalogHref };
