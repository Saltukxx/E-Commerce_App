export const STORE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const SHIPPING_PER_VENDOR_EUR = 5.0;
export const TAX_RATE = 0.19;

/**
 * Marketplace money units:
 * - Product.price, CartLine.price, OrderLine.price: euro **cents**
 * - Order/OrderGroup subtotal, shipping, tax, totalAmount, grandTotal: **euros**
 */

export const sellableProductWhere = {
  status: PRODUCT_STATUS.ACTIVE,
  store: { status: STORE_STATUS.ACTIVE },
};

export function computeVendorTotals(subtotalCents: number) {
  /** [subtotalCents] is euro cents; returned totals are euros. */
  const subtotal = subtotalCents / 100;
  const shipping = SHIPPING_PER_VENDOR_EUR;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Returns null when the cart line is sellable at checkout. */
export function cartLineSellabilityIssue(line: {
  product: { status: string; price: number; store: { status: string } };
  productName: string;
  storeName: string;
}): string | null {
  if (line.product.status !== PRODUCT_STATUS.ACTIVE) {
    return `Product "${line.productName}" is no longer available`;
  }
  if (line.product.store.status !== STORE_STATUS.ACTIVE) {
    return `Seller "${line.storeName}" is not accepting orders`;
  }
  if (line.product.price === 0) {
    return `Product "${line.productName}" requires a price quote`;
  }
  return null;
}
