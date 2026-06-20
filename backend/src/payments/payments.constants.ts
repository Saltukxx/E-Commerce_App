export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  AWAITING_PAYMENT: 'awaiting_payment',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
