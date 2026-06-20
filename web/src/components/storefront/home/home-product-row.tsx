import type { Product } from '@/lib/types';

import { ProductCard } from '@/components/storefront/product-card';

import { RevealOnScroll } from '@/components/storefront/reveal-on-scroll';

import { SectionHeader } from '@/components/storefront/home/section-header';

import { cn } from '@/lib/utils';



export function HomeProductRow({

  products,

  title = 'Empfohlen',

  eyebrow = 'Auswahl',

  href = '/katalog',

}: {

  products: Product[];

  title?: string;

  eyebrow?: string;

  href?: string;

}) {

  if (products.length === 0) return null;



  return (

    <RevealOnScroll as="section">

      <SectionHeader eyebrow={eyebrow} title={title} href={href} />

      <div

        className={cn(

          'scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2',

          'md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4',

        )}

      >

        {products.map((product) => (

          <div

            key={product.id}

            className="w-[168px] min-w-[168px] max-w-[168px] shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none md:shrink"

          >

            <ProductCard product={product} compact />

          </div>

        ))}

      </div>

    </RevealOnScroll>

  );

}

