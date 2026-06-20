import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buildCatalogHref, type CatalogParams } from '@/lib/catalog-products';
import type { ApiListMeta } from '@/lib/types';

export function CatalogPagination({
  params,
  meta,
  className,
}: {
  params: CatalogParams;
  meta: ApiListMeta;
  className?: string;
}) {
  if (meta.total <= meta.limit) return null;

  const page = Math.floor(meta.skip / meta.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const prevPage = page - 1;
  const nextPage = page + 1;
  const hasPrev = page > 1;
  const hasNext = meta.skip + meta.limit < meta.total;

  const linkClass =
    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition';
  const enabledClass =
    'bg-[var(--db-surface)] text-[var(--db-primary)] ring-1 ring-[var(--db-border)] hover:bg-[var(--db-accent)]';
  const disabledClass =
    'cursor-not-allowed bg-[var(--db-surface)] text-[var(--db-muted)] ring-1 ring-[var(--db-border)] opacity-50';

  return (
    <nav
      className={cn('mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
      aria-label="Seiten navigation"
    >
      <p className="text-center text-sm text-[var(--db-muted)] sm:text-left">
        {meta.skip + 1}–{Math.min(meta.skip + meta.limit, meta.total)} von {meta.total} Produkten
      </p>
      <div className="flex items-center justify-center gap-2">
        {hasPrev ? (
          <Link
            href={buildCatalogHref(params, prevPage)}
            className={cn(linkClass, enabledClass, 'min-w-[5.5rem]')}
          >
            Zurück
          </Link>
        ) : (
          <span className={cn(linkClass, disabledClass, 'min-w-[5.5rem]')} aria-disabled="true">
            Zurück
          </span>
        )}
        <span className="px-2 text-sm font-medium text-[var(--db-primary)]">
          Seite {page} / {totalPages}
        </span>
        {hasNext ? (
          <Link
            href={buildCatalogHref(params, nextPage)}
            className={cn(linkClass, enabledClass, 'min-w-[5.5rem]')}
          >
            Weiter
          </Link>
        ) : (
          <span className={cn(linkClass, disabledClass, 'min-w-[5.5rem]')} aria-disabled="true">
            Weiter
          </span>
        )}
      </div>
    </nav>
  );
}
