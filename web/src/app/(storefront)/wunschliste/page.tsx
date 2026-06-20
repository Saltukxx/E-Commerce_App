'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { formatEuro, resolveImageUrl } from '@/lib/utils';
import { PageHeader } from '@/components/ui';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    enabled: !!user,
    queryFn: () => apiFetch<{ data: Product[] }>(`/wishlist/${user!.id}`),
  });

  if (!user) return <PageHeader title="Wunschliste" subtitle="Bitte melden Sie sich an." />;

  return (
    <div>
      <PageHeader title="Wunschliste" />
      {isLoading ? <p>Laden…</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data?.data ?? []).map((product) => (
          <Link key={product.id} href={`/produkt/${product.slug}?store=${product.store.slug}`} className="rounded-2xl border bg-white p-4">
            <div className="relative mb-3 aspect-square">
              <Image src={resolveImageUrl(product.images[0])} alt={product.title} fill className="object-contain" />
            </div>
            <p className="font-medium text-[#001529]">{product.title}</p>
            <p className="mt-1 text-sm">{formatEuro(product.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
