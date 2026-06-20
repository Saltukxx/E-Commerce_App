import Link from 'next/link';
import type { Category } from '@/lib/types';
import { cn, decodeHtmlEntities } from '@/lib/utils';

function sortedCategories(categories: Category[]) {
  return [...categories].sort((a, b) => {
    const countA = a.productCount ?? 0;
    const countB = b.productCount ?? 0;
    if (countB !== countA) return countB - countA;
    return a.name.localeCompare(b.name, 'de');
  });
}

function buildHref(query?: string, categoryId?: number, storeSlug?: string) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (categoryId) params.set('categoryId', String(categoryId));
  if (storeSlug) params.set('storeSlug', storeSlug);
  const qs = params.toString();
  return qs ? `/katalog?${qs}` : '/katalog';
}

const activeClasses =
  'bg-[var(--db-accent)] font-semibold text-[var(--db-primary)] ring-1 ring-[var(--db-primary)]/20';
const inactiveClasses = 'bg-[var(--db-surface)] text-gray-700 ring-1 ring-[var(--db-border)]';

export function CategorySidebar({
  categories,
  activeCategoryId,
  query,
  storeSlug,
  compactMobile = false,
}: {
  categories: Category[];
  activeCategoryId?: string;
  query?: string;
  storeSlug?: string;
  compactMobile?: boolean;
}) {
  const sorted = sortedCategories(categories);
  const allActive = !activeCategoryId;

  return (
    <>
      <nav className="lg:hidden" aria-label="Kategorien">
        {!compactMobile ? (
          <h2 className="font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold uppercase tracking-wide text-gray-500">
            Kategorien
          </h2>
        ) : null}
        <div
          className={cn(
            'scrollbar-hide flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-0.5',
            compactMobile ? 'pt-0' : 'mt-2',
          )}
        >
          <Link
            href={buildHref(query, undefined, storeSlug)}
            className={cn(
              'shrink-0 snap-start rounded-full px-3 py-1.5 text-xs transition',
              allActive ? activeClasses : inactiveClasses,
            )}
          >
            Alle
          </Link>
          {sorted.map((category) => {
            const active = activeCategoryId === String(category.id);
            const label = decodeHtmlEntities(category.name);
            const count = category.productCount ?? 0;
            return (
              <Link
                key={category.id}
                href={buildHref(query, category.id, storeSlug)}
                className={cn(
                  'flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition',
                  active ? activeClasses : inactiveClasses,
                )}
              >
                <span className="max-w-[120px] truncate">{label}</span>
                {count > 0 ? (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] leading-none',
                      active ? 'bg-[var(--db-primary)] text-white' : 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        className="hidden rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 lg:block"
        aria-label="Kategorien"
      >
        <h2 className="font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold uppercase tracking-wide text-gray-500">
          Kategorien
        </h2>
        <ul className="scrollbar-thin mt-3 max-h-[70vh] space-y-1 overflow-y-auto pr-1">
          <li>
            <Link
              href={buildHref(query, undefined, storeSlug)}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm transition',
                allActive ? activeClasses : 'text-gray-700 hover:bg-gray-100',
              )}
            >
              Alle Produkte
            </Link>
          </li>
          {sorted.map((category) => {
            const active = activeCategoryId === String(category.id);
            const label = decodeHtmlEntities(category.name);
            const count = category.productCount ?? 0;
            return (
              <li key={category.id}>
                <Link
                  href={buildHref(query, category.id, storeSlug)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition',
                    active ? activeClasses : 'text-gray-700 hover:bg-gray-100',
                  )}
                >
                  <span className="line-clamp-2">{label}</span>
                  {count > 0 ? (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs',
                        active ? 'bg-[var(--db-primary)] text-white' : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
