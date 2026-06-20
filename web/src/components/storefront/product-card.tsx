'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatEuro, resolveImageUrl } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { SellerLine } from '@/components/storefront/seller-line';

const PLACEHOLDER = '/placeholder-product.svg';

export function ProductCard({
  product,
  compact = false,
  catalog = false,
}: {
  product: Product;
  compact?: boolean;
  catalog?: boolean;
}) {
  const router = useRouter();
  const image = product.images[0];
  const isInquiry = product.price === 0;
  const [imgSrc, setImgSrc] = useState(resolveImageUrl(image));

  const isCatalogCompact = catalog || compact;
  const productHref = `/produkt/${product.slug}?store=${product.store.slug}`;

  function openProduct() {
    router.push(productHref);
  }

  return (
    <article
      className={`card-lift group flex h-full w-full min-w-0 max-w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[var(--db-border)] bg-[var(--db-surface)] md:rounded-2xl ${
        catalog ? 'p-2' : isCatalogCompact ? 'p-2.5' : 'p-4'
      }`}
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProduct();
        }
      }}
      role="link"
      tabIndex={0}
    >
      {catalog ? (
        <div className="mb-2 flex h-[100px] w-full items-center justify-center overflow-hidden rounded-lg border border-[var(--db-border)] bg-white sm:h-[120px]">
          <Image
            src={imgSrc}
            alt={product.title}
            width={120}
            height={120}
            className="max-h-[88px] max-w-full object-contain p-1 sm:max-h-[108px]"
            sizes="(max-width:640px) 42vw, 200px"
            onError={() => setImgSrc(PLACEHOLDER)}
          />
        </div>
      ) : (
        <div
          className={`relative aspect-square w-full max-w-full overflow-hidden rounded-xl border border-[var(--db-border)] bg-white ${
            isCatalogCompact ? 'mb-2' : 'mb-4'
          }`}
        >
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            className="object-contain p-2 transition duration-500 ease-[var(--ease-out-expo)] md:group-hover:scale-[1.04] md:p-4"
            sizes={isCatalogCompact ? '(max-width:768px) 45vw, 25vw' : '(max-width:768px) 50vw, 25vw'}
            onError={() => setImgSrc(PLACEHOLDER)}
          />
        </div>
      )}

      <h3
        className={`line-clamp-2 font-medium leading-snug text-[var(--db-primary)] ${
          catalog ? 'mt-0 text-[11px] leading-tight' : `mt-1 flex-1 ${isCatalogCompact ? 'text-xs' : 'text-sm'}`
        }`}
      >
        {product.title}
      </h3>

      <p
        className={`mt-1.5 font-semibold ${
          catalog ? 'text-xs' : isCatalogCompact ? 'text-sm' : 'text-base'
        } ${isInquiry ? 'text-[var(--db-muted)]' : 'text-[var(--db-primary)]'}`}
      >
        {formatEuro(product.price)}
      </p>

      <SellerLine store={product.store} compact={catalog || isCatalogCompact} />
    </article>
  );
}
