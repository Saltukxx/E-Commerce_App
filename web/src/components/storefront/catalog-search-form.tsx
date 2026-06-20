'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CatalogSearchForm({
  defaultValue = '',
  categoryId,
  storeSlug,
  className,
  inputClassName,
  placeholder = 'Teile, Kompressoren, Zubehör suchen…',
  compact = false,
}: {
  defaultValue?: string;
  categoryId?: string;
  storeSlug?: string;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('q', trimmed);
    if (categoryId) params.set('categoryId', categoryId);
    if (storeSlug) params.set('storeSlug', storeSlug);
    const qs = params.toString();
    router.push(qs ? `/katalog?${qs}` : '/katalog');
  }

  return (
    <form onSubmit={submit} className={cn('w-full', className)}>
      <div className="flex items-stretch gap-2">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          className={cn(
            'min-w-0 flex-1 rounded-full border border-[var(--db-border)] bg-[var(--background)] outline-none transition focus:border-[var(--db-primary)] focus:ring-2 focus:ring-[var(--db-primary)]/10',
            compact ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm',
            inputClassName,
          )}
        />
        <button
          type="submit"
          aria-label="Suchen"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--db-primary)] text-white transition hover:bg-[var(--db-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--db-primary)]/30',
            compact ? 'px-3 py-2' : 'px-4 py-2.5',
          )}
        >
          <Search className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
        </button>
      </div>
    </form>
  );
}
