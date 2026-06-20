'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminStores } from '@/lib/panel-api';
import type { Store } from '@/lib/types';

export function StoreSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (id: number) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => adminStores.list(),
  });

  const stores = data?.data ?? [];

  useEffect(() => {
    if (value === 0 && stores.length > 0) {
      onChange(stores[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, value]);

  return (
    <select
      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#001529]"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={isLoading || stores.length === 0}
    >
      <option value="">{stores.length === 0 ? 'Keine Shops' : 'Shop wählen…'}</option>
      {stores.map((s: Store) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
