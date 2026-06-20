'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { formatEuro, resolveImageUrl } from '@/lib/utils';
import type { CartItem } from '@/lib/types';
import { Button, PageHeader } from '@/components/ui';

export default function CartPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    enabled: !!user,
    queryFn: () => apiFetch<{ data: CartItem[] }>(`/cart/${user!.id}`),
  });

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      apiFetch(`/cart/${user!.id}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart', user?.id] }),
  });

  const removeItem = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/cart/${user!.id}/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart', user?.id] }),
  });

  if (!user) {
    return (
      <div>
        <PageHeader title="Warenkorb" subtitle="Bitte melden Sie sich an." />
        <Link href="/anmelden"><Button>Anmelden</Button></Link>
      </div>
    );
  }

  const items = data?.data ?? [];

  return (
    <div>
      <PageHeader title="Warenkorb" subtitle={`${items.length} Artikel`} />
      {isLoading ? <p>Laden…</p> : null}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="relative h-24 w-24 shrink-0">
              <Image src={resolveImageUrl(item.imageUrl)} alt={item.productName} fill className="object-contain" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#001529]">{item.productName}</p>
              <p className="text-sm text-gray-500">{item.storeName}</p>
              <p className="mt-1 font-medium">{formatEuro(item.price)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <input
                type="number"
                min={1}
                defaultValue={item.quantity}
                className="w-16 rounded border px-2 py-1"
                onBlur={(e) => updateQty.mutate({ id: item.id, quantity: Number(e.target.value) })}
              />
              <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(item.id)}>Entfernen</Button>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 ? (
        <div className="mt-8">
          <Link href="/kasse"><Button>Zur Kasse</Button></Link>
        </div>
      ) : !isLoading ? (
        <p className="text-gray-500">Ihr Warenkorb ist leer.</p>
      ) : null}
    </div>
  );
}
