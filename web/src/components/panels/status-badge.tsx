'use client';

import { Badge } from '@/components/ui';

const storeTones: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  suspended: 'danger',
  pending: 'warning',
};

const productTones: Record<string, 'success' | 'warning' | 'default'> = {
  active: 'success',
  draft: 'warning',
  archived: 'default',
};

const inquiryTones: Record<string, 'warning' | 'success' | 'default'> = {
  pending: 'warning',
  quoted: 'success',
  closed: 'default',
};

const applicationTones: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const payoutTones: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'default',
  paid: 'success',
  rejected: 'danger',
};

export function StatusBadge({
  status,
  kind = 'order',
}: {
  status: string;
  kind?: 'order' | 'store' | 'product' | 'inquiry' | 'payment' | 'application' | 'payout';
}) {
  let tone: 'default' | 'success' | 'warning' | 'danger' = 'default';
  if (kind === 'store') tone = storeTones[status] ?? 'default';
  if (kind === 'product') tone = productTones[status] ?? 'default';
  if (kind === 'inquiry') tone = inquiryTones[status] ?? 'default';
  if (kind === 'application') tone = applicationTones[status] ?? 'default';
  if (kind === 'payout') tone = payoutTones[status] ?? 'default';
  if (kind === 'payment' && status === 'paid') tone = 'success';
  if (kind === 'payment' && status === 'unpaid') tone = 'warning';
  if (kind === 'order' && status === 'Cancelled') tone = 'danger';
  if (kind === 'order' && status === 'Delivered') tone = 'success';

  return <Badge tone={tone}>{status}</Badge>;
}
