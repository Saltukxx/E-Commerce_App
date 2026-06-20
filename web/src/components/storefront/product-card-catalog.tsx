import Link from 'next/link';
import Image from 'next/image';
import { formatEuro, resolveImageUrl } from '@/lib/utils';
import type { ProductCard as ProductCardType } from '@/lib/types';
import { SellerLineLinks } from '@/components/storefront/seller-line-links';

const PLACEHOLDER = '/placeholder-product.svg';

export function ProductCardCatalog({ product }: { product: ProductCardType }) {
  const image = product.images[0];
  const isInquiry = product.price === 0;
  const productHref = `/produkt/${product.slug}?store=${product.store.slug}`;

  return (
    <article className="card-lift group flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-[var(--db-border)] bg-[var(--db-surface)] p-2 md:rounded-2xl">
      <Link href={productHref} className="block min-w-0">
        <div className="mb-2 flex h-[100px] w-full items-center justify-center overflow-hidden rounded-lg border border-[var(--db-border)] bg-white sm:h-[120px]">
          <Image
            src={image ? resolveImageUrl(image) : PLACEHOLDER}
            alt={product.title}
            width={120}
            height={120}
            className="max-h-[88px] max-w-full object-contain p-1 sm:max-h-[108px]"
            sizes="(max-width:640px) 42vw, 200px"
          />
        </div>
        <h3 className="line-clamp-2 text-[11px] font-medium leading-tight text-[var(--db-primary)]">
          {product.title}
        </h3>
        <p
          className={`mt-1.5 text-xs font-semibold ${
            isInquiry ? 'text-[var(--db-muted)]' : 'text-[var(--db-primary)]'
          }`}
        >
          {formatEuro(product.price)}
        </p>
      </Link>
      <SellerLineLinks store={product.store} compact />
    </article>
  );
}
