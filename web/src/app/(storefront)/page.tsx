import type { Category, Store } from '@/lib/types';

import { BannerCarousel } from '@/components/storefront/home/banner-carousel';

import { HomeProductRow } from '@/components/storefront/home/home-product-row';

import { MarketingHero } from '@/components/storefront/home/marketing-hero';

import { PopularCategoriesGrid } from '@/components/storefront/home/popular-categories-grid';

import { ShowcaseStoresSection } from '@/components/storefront/home/showcase-stores-section';

import { TopBrandsSection } from '@/components/storefront/home/top-brands-section';

import { fetchHomeProducts } from '@/lib/home-products';

import { findEmbracoCategory, resolveShowcaseStores } from '@/lib/mobile-assets';

import { getServerApiUrl } from '@/lib/server-api';

import { parseApiList } from '@/lib/utils';



async function getHomeData() {

  const api = getServerApiUrl();

  try {

    const [categoriesRes, storesRes, homeProducts] = await Promise.all([

      fetch(`${api}/categories`, { next: { revalidate: 60 } }),

      fetch(`${api}/stores`, { next: { revalidate: 60 } }),

      fetchHomeProducts(api),

    ]);

    if (!categoriesRes.ok || !storesRes.ok) {

      return {

        categories: [],

        stores: [],

        newest: [],

        bestselling: [],

        recommended: [],

      };

    }

    const categories = parseApiList<Category>(await categoriesRes.json());

    const storesJson = (await storesRes.json()) as { data?: Store[] };

    return {

      categories,

      stores: storesJson.data ?? [],

      ...homeProducts,

    };

  } catch {

    return {

      categories: [],

      stores: [],

      newest: [],

      bestselling: [],

      recommended: [],

    };

  }

}



export default async function HomePage() {

  const { categories, stores, newest, bestselling, recommended } = await getHomeData();

  const embracoCategory = findEmbracoCategory(categories);

  const showcaseStores = resolveShowcaseStores(stores);



  return (

    <div className="space-y-10 md:space-y-14 lg:space-y-16">

      <MarketingHero />

      <ShowcaseStoresSection stores={showcaseStores} />

      <HomeProductRow

        products={newest}

        eyebrow="Frisch"

        title="Neu im Sortiment"

        href="/katalog"

      />

      <PopularCategoriesGrid categories={categories} compressorCategory={embracoCategory} />

      <HomeProductRow

        products={bestselling}

        eyebrow="Top"

        title="Meistverkauft"

        href="/katalog"

      />

      <HomeProductRow

        products={recommended}

        eyebrow="Auswahl"

        title="Empfohlen"

        href="/katalog"

      />

      {embracoCategory ? <TopBrandsSection categoryId={embracoCategory.id} /> : null}

      <BannerCarousel />

    </div>

  );

}

