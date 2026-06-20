import { apiFetch, getApiUrl } from './api-client';
import { useAuthStore } from './auth-store';
import type { ApiListMeta, Category, Product, Store, UserProfile } from './types';

type ListResponse<T> = { data: T; meta?: ApiListMeta; msg?: string };

export type StoreApplication = {
  id: number;
  businessName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  message: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string | null;
};

export type AdminStoreDetail = Store & {
  owner?: { id: number; email: string; name: string } | null;
  productCount?: number;
  orderCount?: number;
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean;
  payoutsEnabled?: boolean;
  featuredProductIds?: number[];
};

export type AdminOrderGroup = {
  orderGroupId: number;
  user: { id: number; name: string; email: string };
  grandTotal: number;
  paymentStatus: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  orders: Array<{
    orderId: number;
    status: string;
    subtotal: number;
    shipping: number;
    tax: number;
    totalAmount: number;
    store: { id: number; name: string; slug: string };
    items: Array<{
      id: number;
      productName: string;
      quantity: number;
      price: number;
    }>;
  }>;
};

export type PriceInquiryRow = {
  id: number;
  status: string;
  productName: string;
  quoteCents: number | null;
  adminNote: string;
  createdAt: string;
  user: { id: number; name: string; email: string };
  product: { id: number; slug: string; title: string };
  store?: { id: number; name: string; slug: string };
};

export type VendorOrder = {
  id: number;
  orderGroupId: number;
  orderDate: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  storeName: string;
  customer?: { id: number; name: string; email: string } | null;
  shippingAddress?: {
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }>;
};

export type VendorStoreDetail = Store & {
  featuredProductIds?: number[];
  productCount?: number;
  orderCount?: number;
  payoutBankIban?: string;
  payoutBankHolder?: string;
};

export type VendorCategory = Category & { productCount: number };

export type VendorStats = {
  orderCount: number;
  pendingOrders: number;
  pendingInquiries: number;
  productCount: number;
  lowStockCount: number;
  revenueTotal: number;
  topProducts: Array<{ productId: number; quantity: number; title: string; slug: string }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  productsByCategory: Array<{ categoryId: number; categoryName: string; count: number }>;
  recentOrders: Array<{
    id: number;
    status: string;
    totalAmount: number;
    paymentStatus: string;
    customerName: string;
    orderDate: string;
  }>;
  dailyRevenue: Array<{ day: string; revenue: number }>;
};

export type FinanceSummary = {
  availableCents: number;
  pendingPayoutCents: number;
  lifetimeEarnedCents: number;
};

export type PayoutRequest = {
  id: number;
  storeId: number;
  amountCents: number;
  status: string;
  bankIban: string;
  bankHolder: string;
  adminNote: string;
  requestedAt: string;
  processedAt?: string | null;
  store?: { id: number; name: string; slug: string };
};

export type DashboardStats = {
  orderGroupCount: number;
  pendingApplications: number;
  pendingPriceInquiries: number;
  activeStores: number;
  productCount: number;
  recentOrders: Array<{
    id: number;
    grandTotal: number;
    paymentStatus: string;
    createdAt: string;
  }>;
};

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export async function apiUpload(path: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetch<{ data: { path: string } }>(`/${path}`, {
    method: 'POST',
    body: form,
  });
  return res.data.path;
}

export const adminDashboard = {
  stats: () => apiFetch<ListResponse<DashboardStats>>('/admin/dashboard/stats'),
};

export const adminApplications = {
  list: (status = 'pending') =>
    apiFetch<ListResponse<StoreApplication[]>>(`/admin/store-applications${qs({ status })}`),
  approve: (id: number) =>
    apiFetch<{ data: { store: Store; vendorEmail: string; tempPassword?: string }; msg: string }>(
      `/admin/store-applications/${id}/approve`,
      { method: 'POST' },
    ),
  reject: (id: number, rejectionReason: string) =>
    apiFetch(`/admin/store-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    }),
};

export const adminStores = {
  list: () => apiFetch<ListResponse<Store[]>>('/admin/stores'),
  get: (id: number) => apiFetch<ListResponse<AdminStoreDetail>>(`/admin/stores/${id}`),
  update: (id: number, body: Record<string, unknown>) =>
    apiFetch(`/admin/stores/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateStatus: (id: number, status: 'active' | 'suspended') =>
    apiFetch(`/admin/stores/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  stripeOnboard: (id: number) =>
    apiFetch<{ data: { onboardingUrl: string } }>(`/admin/stores/${id}/stripe-onboard`, { method: 'POST' }),
  stripeSync: (id: number) =>
    apiFetch(`/admin/stores/${id}/stripe-sync`, { method: 'POST' }),
};

export const adminCategories = {
  list: () => apiFetch<ListResponse<Category[]>>('/admin/categories'),
  create: (body: { name: string; slug?: string; image?: string }) =>
    apiFetch<ListResponse<Category>>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: number, body: { name?: string; slug?: string; image?: string }) =>
    apiFetch(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
};

export const adminProducts = {
  list: (params: {
    q?: string;
    storeId?: number;
    categoryId?: number;
    skip?: number;
    limit?: number;
  }) => apiFetch<ListResponse<Product[]>>(`/admin/products${qs(params)}`),
  get: (id: number) => apiFetch<ListResponse<Product>>(`/admin/products/${id}`),
  create: (body: Record<string, unknown>) =>
    apiFetch<{ data: Product }>('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Record<string, unknown>) =>
    apiFetch<{ data: Product }>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
};

export const adminOrders = {
  list: (params: { status?: string; storeId?: number; skip?: number; limit?: number }) =>
    apiFetch<ListResponse<AdminOrderGroup[]>>(`/admin/orders${qs(params)}`),
  get: (id: number) => apiFetch<ListResponse<AdminOrderGroup>>(`/admin/orders/${id}`),
};

export const adminPriceInquiries = {
  list: () => apiFetch<ListResponse<PriceInquiryRow[]>>('/admin/price-inquiries'),
  update: (id: number, body: { status: string; quoteCents?: number; adminNote?: string }) =>
    apiFetch(`/admin/price-inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const vendorStore = {
  get: () => apiFetch<ListResponse<VendorStoreDetail>>('/vendor/store'),
  update: (body: Record<string, unknown>) =>
    apiFetch('/vendor/store', { method: 'PATCH', body: JSON.stringify(body) }),
};

export const vendorCategories = {
  list: () => apiFetch<ListResponse<VendorCategory[]>>('/vendor/categories'),
};

export const vendorDashboard = {
  stats: (params?: { from?: string; to?: string }) =>
    apiFetch<ListResponse<VendorStats>>(`/vendor/dashboard/stats${qs(params ?? {})}`),
};

export const vendorFinance = {
  summary: () => apiFetch<ListResponse<FinanceSummary>>('/vendor/finance/summary'),
  ledger: (skip = 0, limit = 50) =>
    apiFetch<ListResponse<Array<{ id: number; type: string; amountCents: number; note: string; createdAt: string }>>>(
      `/vendor/finance/ledger${qs({ skip, limit })}`,
    ),
  payoutRequests: () => apiFetch<ListResponse<PayoutRequest[]>>('/vendor/finance/payout-requests'),
  createPayout: (body: { amountCents: number; bankIban: string; bankHolder: string }) =>
    apiFetch('/vendor/finance/payout-requests', { method: 'POST', body: JSON.stringify(body) }),
};

export const adminPayouts = {
  list: (status?: string) =>
    apiFetch<ListResponse<PayoutRequest[]>>(`/admin/payout-requests${qs({ status })}`),
  update: (id: number, body: { status: string; adminNote?: string }) =>
    apiFetch(`/admin/payout-requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const vendorProducts = {
  list: (params: {
    q?: string;
    categoryId?: number;
    status?: string;
    priceType?: string;
    lowStock?: boolean;
    skip?: number;
    limit?: number;
  }) => apiFetch<ListResponse<Product[]>>(`/vendor/products${qs(params)}`),
  get: (id: number) => apiFetch<ListResponse<Product>>(`/vendor/products/${id}`),
  create: (body: Record<string, unknown>) =>
    apiFetch<{ data: Product }>('/vendor/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Record<string, unknown>) =>
    apiFetch<{ data: Product }>(`/vendor/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => apiFetch(`/vendor/products/${id}`, { method: 'DELETE' }),
  duplicate: (id: number) =>
    apiFetch<{ data: Product }>(`/vendor/products/${id}/duplicate`, { method: 'POST' }),
  bulkUpdate: (body: { ids: number[]; status?: string; categoryId?: number }) =>
    apiFetch('/vendor/products/bulk', { method: 'PATCH', body: JSON.stringify(body) }),
  bulkRemove: (ids: number[]) =>
    apiFetch('/vendor/products/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
  importPreview: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<{ data: { total: number; valid: number; invalid: number; rows: Array<{ row: number; title: string; errors: string[] }> } }>(
      '/vendor/products/import/preview',
      { method: 'POST', body: form },
    );
  },
  importExecute: async (file: File, mode: 'upsert' | 'create_only' = 'upsert') => {
    const form = new FormData();
    form.append('file', file);
    form.append('mode', mode);
    return apiFetch<{ data: { created: number; updated: number; skipped: number } }>(
      '/vendor/products/import',
      { method: 'POST', body: form },
    );
  },
  downloadTemplate: async () => {
    const { accessToken } = useAuthStore.getState();
    const res = await fetch(`${getApiUrl()}/vendor/products/import/template`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error('Vorlage konnte nicht geladen werden');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};

export const vendorOrders = {
  list: (params?: { status?: string; skip?: number; limit?: number }) =>
    apiFetch<ListResponse<VendorOrder[]>>(`/vendor/orders${qs(params ?? {})}`),
  get: (id: number) => apiFetch<ListResponse<VendorOrder>>(`/vendor/orders/${id}`),
  updateStatus: (id: number, status: string) =>
    apiFetch(`/vendor/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

export const vendorPriceInquiries = {
  list: () => apiFetch<ListResponse<PriceInquiryRow[]>>('/vendor/price-inquiries'),
  update: (id: number, body: { status: string; quoteCents?: number; adminNote?: string }) =>
    apiFetch(`/vendor/price-inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export type { UserProfile };
