import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import {
  popularCategoryImagePath,
  popularCategoryLabel,
  resolvePopularHomeCategories,
} from '@/lib/mobile-assets';
import { resolveImageUrl } from '@/lib/utils';
import { RevealOnScroll } from '@/components/storefront/reveal-on-scroll';
import { SectionHeader } from '@/components/storefront/home/section-header';

export function PopularCategoriesGrid({
  categories,
  compressorCategory,
}: {
  categories: Category[];
  compressorCategory?: Category | null;
}) {
  const displayCategories = resolvePopularHomeCategories(categories, compressorCategory);
  if (displayCategories.length === 0) return null;

  return (
    <RevealOnScroll as="section">
      <SectionHeader
        eyebrow="Katalog"
        title="Beliebte Kategorien"
        subtitle="Kompressoren, Kältemittel, Panel und mehr — direkt zum Sortiment."
        href="/katalog"
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {displayCategories.map((category, index) => {
          const rawPath = popularCategoryImagePath(category);
          const imagePath = rawPath
            ? rawPath.startsWith('/assets')
              ? rawPath
              : resolveImageUrl(rawPath)
            : null;
          const label = popularCategoryLabel(category);
          const delay = Math.min(index, 4) as 0 | 1 | 2 | 3 | 4;

          return (
            <RevealOnScroll key={category.id} delay={delay}>
              <Link
                href={`/katalog?categoryId=${category.id}`}
                className="card-lift group relative block aspect-square overflow-hidden rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)]"
              >
                {imagePath ? (
                  <>
                    <Image
                      src={imagePath}
                      alt={label}
                      fill
                      className="object-cover transition duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105"
                      sizes="(max-width:768px) 50vw, 280px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <p className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white md:text-base">
                      {label}
                    </p>
                  </>
                ) : (
                  <p className="flex h-full items-end p-4 text-sm font-semibold text-[var(--db-primary)]">
                    {label}
                  </p>
                )}
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>
    </RevealOnScroll>
  );
}
