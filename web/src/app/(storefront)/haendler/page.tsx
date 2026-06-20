'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { storeLogoPath, storeTagline } from '@/lib/mobile-assets';
import type { Store } from '@/lib/types';
import { PageHeader } from '@/components/ui';
import { TrustBadges } from '@/components/storefront/trust-badges';
import { resolveImageUrl } from '@/lib/utils';

export default function VendorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => apiFetch<{ data: Store[] }>('/stores'),
  });

  return (
    <div>
      <PageHeader title="Händler" subtitle="Geprüfte HVAC-Anbieter auf DurmusBaba" />
      {isLoading ? <p>Laden…</p> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(data?.data ?? []).map((store) => (
          <Link
            key={store.id}
            href={`/shop/${store.slug}`}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#001529]/20"
          >
            <div className="flex gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200/60 bg-[#E6F4FF]/50">
                <Image
                  src={store.logo ? resolveImageUrl(store.logo) : storeLogoPath(store.slug)}
                  alt={store.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#001529]">{store.name}</p>
                {store.deliveryArea ? (
                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">{store.deliveryArea}</p>
                ) : null}
                {store.productCount != null ? (
                  <p className="mt-1 text-xs text-gray-500">{store.productCount} Produkte</p>
                ) : null}
              </div>
            </div>
            <TrustBadges store={store} compact />
            <p className="line-clamp-2 text-sm text-gray-600">
              {storeTagline(store.slug, store.description)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
