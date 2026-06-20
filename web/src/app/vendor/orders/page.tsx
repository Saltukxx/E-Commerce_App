'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, PageHeader } from '@/components/ui';
import { vendorOrders, vendorStore } from '@/lib/panel-api';
import { DataTable } from '@/components/panels/data-table';
import { Pagination } from '@/components/panels/pagination';
import { StatusBadge } from '@/components/panels/status-badge';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { VendorSuspendedAlert } from '@/components/vendor/vendor-suspended-alert';

const NEXT_STATUS: Record<string, string> = {
  Pending: 'Confirmed',
  Confirmed: 'Shipped',
  Shipped: 'Delivered',
};

const STATUS_FILTERS = [
  { value: '', label: 'Alle' },
  { value: 'Pending', label: 'Ausstehend' },
  { value: 'Confirmed', label: 'Bestätigt' },
  { value: 'Shipped', label: 'Versendet' },
  { value: 'Delivered', label: 'Geliefert' },
  { value: 'Cancelled', label: 'Storniert' },
];

export default function VendorOrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const { data: storeData } = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const suspended = storeData?.data?.status === 'suspended';

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', filter, skip],
    queryFn: () => vendorOrders.list({ status: filter || undefined, skip, limit }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      vendorOrders.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-orders'] }),
  });

  const orders = data?.data ?? [];
  const total = data?.meta?.total ?? orders.length;

  const rows = orders.map((order) => ({
    id: order.id,
    customer: order.customer?.name ?? '—',
    date: new Date(order.orderDate).toLocaleDateString('de-DE'),
    total: `${order.totalAmount.toFixed(2)} €`,
    payment: <StatusBadge status={order.paymentStatus} kind="payment" />,
    status: <StatusBadge status={order.status} kind="order" />,
    actions: (
      <div className="flex flex-wrap gap-2">
        <Link href={`/vendor/orders/${order.id}`}>
          <Button size="sm" variant="secondary">Details</Button>
        </Link>
        {!suspended && NEXT_STATUS[order.status] ? (
          <Button
            size="sm"
            onClick={() => updateStatus.mutate({ id: order.id, status: NEXT_STATUS[order.status] })}
          >
            → {NEXT_STATUS[order.status]}
          </Button>
        ) : null}
      </div>
    ),
  }));

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader title="Bestellungen" />
      {suspended ? <VendorSuspendedAlert /> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s.value || 'all'}
            size="sm"
            variant={filter === s.value ? 'primary' : 'secondary'}
            onClick={() => {
              setFilter(s.value);
              setSkip(0);
            }}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <DataTable
        isLoading={isLoading}
        keyField="id"
        columns={[
          { key: 'id', header: '#' },
          { key: 'customer', header: 'Kunde' },
          { key: 'date', header: 'Datum' },
          { key: 'total', header: 'Summe' },
          { key: 'payment', header: 'Zahlung' },
          { key: 'status', header: 'Status' },
          { key: 'actions', header: '' },
        ]}
        rows={rows}
      />
      <Pagination
        meta={{ skip, limit, total }}
        onPageChange={setSkip}
      />
    </div>
  );
}
