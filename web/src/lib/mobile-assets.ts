import type { Category, Store } from '@/lib/types';

export const OFFICIAL_VENDOR_SLUG = 'drc-kaltetechnik';

export const MOBILE_ASSETS = {
  welcomeBanner: '/assets/hero-lueftung-klima-heizung.png',
  embracoPromo: '/assets/embraco_home_promo.png',
  banners: [
    { id: 'marktplatz', image: '/assets/hero-hvac-marktplatz.png', href: '/katalog' },
    { id: 'drc', image: '/assets/store_banner_drc_kaltetechnik.png', href: '/shop/drc-kaltetechnik' },
    { id: 'kaelte', image: '/assets/banner-kaeltetechnik-profis.png', href: '/katalog' },
  ],
  categoryCompressors: '/assets/home_category_compressors.png',
  categoryAxialVentilators: '/assets/home_category_axialventilators.png',
  categoryPanel: '/assets/home_category_panel.png',
  categoryRefrigerant: '/assets/home_category_refrigerant.png',
  categoryCoolingDisplay: '/assets/home_category_cooling_display.png',
  brandLogoFallback: '/assets/ic_brand_logo.png',
  storeLogo: {
    'drc-kaltetechnik': '/assets/store_logo_drc_kaltetechnik.png',
    'kaeltekontor-hamburg': '/assets/store_logo_kaeltekontor_hamburg.png',
    'nordklima-technik': '/assets/store_logo_nordklima_technik.png',
  },
  storeBanner: {
    'drc-kaltetechnik': '/assets/store_banner_drc_kaltetechnik.png',
  },
} as const;

export const SHOWCASE_STORE_SLUGS = [
  'drc-kaltetechnik',
  'kaeltekontor-hamburg',
  'nordklima-technik',
] as const;

export const STORE_TAGLINES: Record<string, string> = {
  'drc-kaltetechnik': 'Offizieller DRC-Kältetechnik Großhandel auf dem DurmusBaba Marktplatz',
  'kaeltekontor-hamburg': 'Kälte- und Klimatechnik für Installateure in Norddeutschland',
  'nordklima-technik': 'Großhandel für Verdichter, Kältemittel und Kältekomponenten',
};

const DEFAULT_STORE_FIELDS = {
  banner: '',
  deliveryArea: '',
  city: '',
  website: '',
  certifications: [] as string[],
  paymentsReady: false,
  avgResponseHours: null,
  responseTimeLabel: null,
};

const FALLBACK_SHOWCASE_STORES: Store[] = [
  {
    id: 0,
    name: 'DRC-Kältetechnik',
    slug: 'drc-kaltetechnik',
    logo: '',
    description: STORE_TAGLINES['drc-kaltetechnik'],
    status: 'active',
    contactEmail: '',
    phone: '',
    isFeatured: true,
    ...DEFAULT_STORE_FIELDS,
  },
  {
    id: -1,
    name: 'Kältekontor Hamburg',
    slug: 'kaeltekontor-hamburg',
    logo: '',
    description: STORE_TAGLINES['kaeltekontor-hamburg'],
    status: 'active',
    contactEmail: '',
    phone: '',
    isFeatured: true,
    ...DEFAULT_STORE_FIELDS,
  },
  {
    id: -2,
    name: 'NordKlima Technik',
    slug: 'nordklima-technik',
    logo: '',
    description: STORE_TAGLINES['nordklima-technik'],
    status: 'active',
    contactEmail: '',
    phone: '',
    isFeatured: true,
    ...DEFAULT_STORE_FIELDS,
  },
];

export function storeLogoPath(slug: string): string {
  const key = slug.toLowerCase() as keyof typeof MOBILE_ASSETS.storeLogo;
  return MOBILE_ASSETS.storeLogo[key] ?? MOBILE_ASSETS.brandLogoFallback;
}

export function storeBannerPath(slug: string): string | null {
  const key = slug.toLowerCase() as keyof typeof MOBILE_ASSETS.storeBanner;
  return MOBILE_ASSETS.storeBanner[key] ?? null;
}

export function storeBannerGradientClass(slug: string): string {
  switch (slug.toLowerCase()) {
    case 'drc-kaltetechnik':
      return 'bg-gradient-to-r from-[#001529] to-[#003366]';
    case 'kaeltekontor-hamburg':
      return 'bg-gradient-to-r from-[#1565C0] to-[#0A3D7A]';
    case 'nordklima-technik':
      return 'bg-gradient-to-r from-[#00838F] to-[#004D57]';
    default:
      return 'bg-gradient-to-r from-[#001529] to-[#003366]';
  }
}

export function storeTagline(slug: string, description?: string): string {
  if (description?.trim()) return description.trim();
  return STORE_TAGLINES[slug.toLowerCase()] ?? 'Shop besuchen';
}

export function findOfficialVendor(stores: Store[]): Store | undefined {
  return (
    stores.find((s) => s.slug.toLowerCase() === OFFICIAL_VENDOR_SLUG) ??
    stores.find((s) => s.isFeatured)
  );
}

export function resolveShowcaseStores(apiStores: Store[]): Store[] {
  const active = apiStores.filter((s) => s.status === 'active' || !s.status);
  const featured = active.filter((s) => s.isFeatured);
  if (featured.length > 0) {
    return featured.slice(0, 6);
  }

  const bySlug = new Map(active.map((s) => [s.slug.toLowerCase(), s]));
  const fromAllowlist = SHOWCASE_STORE_SLUGS.map(
    (slug) => bySlug.get(slug) ?? FALLBACK_SHOWCASE_STORES.find((s) => s.slug === slug)!,
  ).filter(Boolean);
  if (fromAllowlist.length > 0) return fromAllowlist;

  return active.slice(0, 3);
}

export function findEmbracoCategory(categories: Category[]): Category | undefined {
  return categories.find((c) => c.slug.toLowerCase() === 'embraco-compressors');
}

function isCompressorCategory(category: Category): boolean {
  const slug = category.slug.toLowerCase();
  const name = category.name.toLowerCase();
  if (slug === 'kompressoren' || slug === 'verdichter' || slug.startsWith('verdichter-')) return true;
  if (name === 'kompressoren') return true;
  if (slug.includes('embraco-compressors')) return true;
  if (slug.includes('compressor') && !slug.includes('accessories')) return true;
  return name.includes('kompressor') || name.includes('compressor') || name.includes('verdichter');
}

function findPanelCategory(categories: Category[]): Category | undefined {
  return categories.find(
    (c) =>
      c.slug.toLowerCase() === 'panel' ||
      c.slug.toLowerCase().includes('panel') ||
      c.name.toLowerCase().includes('panel'),
  );
}

function findRefrigerantCategory(categories: Category[]): Category | undefined {
  return categories.find((c) => {
    const slug = c.slug.toLowerCase();
    const name = c.name.toLowerCase();
    return (
      slug.includes('kaelt') ||
      slug.includes('kält') ||
      name.includes('kaelt') ||
      name.includes('kält') ||
      name.includes('refrigerant')
    );
  });
}

function findCoolingCategory(categories: Category[]): Category | undefined {
  return categories.find((c) => {
    const slug = c.slug.toLowerCase();
    const name = c.name.toLowerCase();
    return (
      slug.includes('kuehl') ||
      slug.includes('vitrin') ||
      name.includes('kuehl') ||
      name.includes('kühl') ||
      name.includes('vitrin') ||
      name.includes('schran')
    );
  });
}

function findCompressorCategory(categories: Category[], compressorCategory?: Category | null): Category | undefined {
  if (compressorCategory) return compressorCategory;
  return (
    categories.find((c) => c.slug.toLowerCase() === 'embraco-compressors') ??
    categories.find((c) => c.slug.toLowerCase() === 'kompressoren') ??
    categories.find((c) => c.name.toLowerCase() === 'kompressoren') ??
    categories.find((c) => c.slug.toLowerCase() === 'verdichter') ??
    categories.find((c) => c.slug.toLowerCase().startsWith('verdichter-')) ??
    categories.find((c) => {
      const slug = c.slug.toLowerCase();
      return slug.includes('compressor') && !slug.includes('accessories');
    }) ??
    categories.find((c) => isCompressorCategory(c))
  );
}

export function resolvePopularHomeCategories(
  categories: Category[],
  compressorCategory?: Category | null,
): Category[] {
  const withProducts = categories.filter((c) => (c.productCount ?? 0) > 0);
  if (withProducts.length > 0) {
    return [...withProducts]
      .sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0))
      .slice(0, 4);
  }

  const compressor = findCompressorCategory(categories, compressorCategory);
  const items = [
    findPanelCategory(categories),
    findRefrigerantCategory(categories),
    findCoolingCategory(categories),
    compressor,
  ].filter((c): c is Category => c != null);

  const seen = new Set<number>();
  return items.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  }).slice(0, 4);
}

export function popularCategoryLabel(category: Category): string {
  if (isCompressorCategory(category)) return 'Kompressoren';
  return category.name.replace(/&amp;/g, '&');
}

function isUsableCategoryImage(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (lower.includes('placehold.co')) return false;
  if (lower.includes('placeholder')) return false;
  if (lower.includes('text=urun')) return false;
  return true;
}

export function popularCategoryImagePath(category: Category): string | null {
  if (isUsableCategoryImage(category.image)) {
    return category.image!;
  }
  if (isCompressorCategory(category)) return MOBILE_ASSETS.categoryCompressors;
  const slug = category.slug.toLowerCase();
  const name = category.name.toLowerCase();
  if (slug.includes('axialventilator') || name.includes('axialventilator')) {
    return MOBILE_ASSETS.categoryAxialVentilators;
  }
  if (slug.includes('panel') || name.includes('panel')) return MOBILE_ASSETS.categoryPanel;
  if (
    slug.includes('split') ||
    name.includes('split') ||
    slug.includes('luftkuehl') ||
    slug.includes('luftkühl') ||
    name.includes('luftkuehl') ||
    name.includes('luftkühl')
  ) {
    return MOBILE_ASSETS.categoryCoolingDisplay;
  }
  if (
    slug.includes('kaelt') ||
    slug.includes('kält') ||
    name.includes('kaelt') ||
    name.includes('kält') ||
    name.includes('refrigerant')
  ) {
    return MOBILE_ASSETS.categoryRefrigerant;
  }
  if (
    slug.includes('kuehl') ||
    slug.includes('vitrin') ||
    name.includes('kuehl') ||
    name.includes('kühl') ||
    name.includes('vitrin') ||
    name.includes('schran')
  ) {
    return MOBILE_ASSETS.categoryCoolingDisplay;
  }
  return MOBILE_ASSETS.categoryCompressors;
}
