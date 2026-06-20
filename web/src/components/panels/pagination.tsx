'use client';

import { Button } from '@/components/ui';
import type { ApiListMeta } from '@/lib/types';

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: ApiListMeta;
  onPageChange: (skip: number) => void;
}) {
  const page = Math.floor(meta.skip / meta.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const prevSkip = Math.max(0, meta.skip - meta.limit);
  const nextSkip = meta.skip + meta.limit;

  if (meta.total <= meta.limit) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-center text-sm text-gray-500 sm:text-left">
        {meta.skip + 1}–{Math.min(meta.skip + meta.limit, meta.total)} von {meta.total}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          size="sm"
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={meta.skip === 0}
          onClick={() => onPageChange(prevSkip)}
        >
          Zurück
        </Button>
        <span className="text-center text-sm text-gray-600 sm:px-2">
          Seite {page} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={nextSkip >= meta.total}
          onClick={() => onPageChange(nextSkip)}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
