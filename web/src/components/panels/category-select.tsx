'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Category } from '@/lib/types';

export function CategorySelect({
  value,
  onChange,
  admin = false,
}: {
  value: number;
  onChange: (id: number) => void;
  admin?: boolean;
}) {
  const { data, isLoading } = useQuery({
    queryKey: admin ? ['admin-categories'] : ['categories'],
    queryFn: () =>
      apiFetch<{ data: Category[] }>(admin ? '/admin/categories' : '/categories'),
  });

  const categories = data?.data ?? [];

  useEffect(() => {
    if (value === 0 && categories.length > 0) {
      onChange(categories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-pick once categories load
  }, [categories, value]);

  return (
    <select
      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#001529]"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={isLoading || categories.length === 0}
    >
      <option value="">{categories.length === 0 ? 'Keine Kategorien' : 'Kategorie wählen…'}</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
