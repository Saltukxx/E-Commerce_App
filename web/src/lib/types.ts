export type UserRole = 'customer' | 'admin' | 'vendor';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
}

export interface StoreTrust {
  isFeatured: boolean;
  paymentsReady: boolean;
  avgResponseHours: number | null;
  responseTimeLabel: string | null;
}

export interface StoreSummary {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

export interface Store extends StoreSummary, StoreTrust {
  description: string;
  banner: string;
  deliveryArea: string;
  city: string;
  website: string;
  certifications: string[];
  status: string;
  contactEmail: string;
  phone: string;
  productCount?: number;
}

export interface StoreDetail extends Store {
  productCount: number;
  categories: Category[];
  featuredProducts: Product[];
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  stockQty: number | null;
  images: string[];
  status: string;
  category: Category;
  store: StoreSummary;
}

/** Lightweight list/card shape from GET /products?view=card */
export interface ProductCard {
  id: number;
  title: string;
  slug: string;
  price: number;
  images: string[];
  store: StoreSummary;
}

export interface CartItem {
  id: number;
  productId: number;
  userId: number;
  storeId: number;
  storeName: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  productName: string;
}

export interface CartSummary {
  subtotalCents: number;
  shippingEuro: number;
  taxEuro: number;
  grandTotalEuro: number;
  vendors: Array<{
    storeId: number;
    storeName: string;
    subtotalCents: number;
    shipping: number;
    tax: number;
    total: number;
  }>;
}

export interface ApiListMeta {
  total: number;
  skip: number;
  limit: number;
}
