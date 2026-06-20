import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MOBILE_ASSETS } from '@/lib/mobile-assets';
import { RevealOnScroll } from '@/components/storefront/reveal-on-scroll';
import { SectionHeader } from '@/components/storefront/home/section-header';

export function TopBrandsSection({ categoryId }: { categoryId: number }) {
  return (
    <RevealOnScroll as="section">
      <SectionHeader eyebrow="Top Marken" title="Vertrauenswürdige Hersteller" />
      <Link
        href={`/katalog?categoryId=${categoryId}`}
        className="card-lift group relative block h-36 overflow-hidden rounded-2xl border border-[var(--db-border)] md:h-44"
      >
        <Image
          src={MOBILE_ASSETS.embracoPromo}
          alt="Embraco Kompressoren"
          fill
          className="object-cover transition duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--db-primary)]/85 via-[var(--db-primary)]/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-5 md:px-8">
          <span className="rounded-lg bg-white/95 px-4 py-2 font-[family-name:var(--font-plus-jakarta)] text-xl font-bold lowercase tracking-tight text-[var(--db-primary)]">
            embraco
          </span>
          <span className="db-btn db-btn-hero pointer-events-none min-h-0 px-4 py-2 text-sm">
            Entdecken
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </RevealOnScroll>
  );
}
