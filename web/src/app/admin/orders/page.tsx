'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, PageHeader } from '@/components/ui';
import { adminOrders, adminStores } from '@/lib/panel-api';
import { DataTable } from '@/components/panels/data-table';
import { Pagination } from '@/components/panels/pagination';
import { StatusBadge } from '@/components/panels/status-badge';

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [storeId, setStoreId] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const { data: storesData } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => adminStores.list(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, storeId, skip],
    queryFn: () =>
      adminOrders.list({
        status: status || undefined,
        storeId: storeId || undefined,
        skip,
        limit,
      }),
  });

  const rows = (data?.data ?? []).map((order) => ({
    id: order.orderGroupId,
    customer: `${order.user.name} (${order.user.email})`,
    total: `${order.grandTotal.toFixed(2)} €`,
    payment: <StatusBadge status={order.paymentStatus} kind="payment" />,
    stores: order.orders.map((o) => o.store.name).join(', '),
    actions: (
      <Link href={`/admin/orders/${order.orderGroupId}`}>
        <Button size="sm" variant="secondary">Details</Button>
      </Link>
    ),
  }));

  return (
    <div>
      <PageHeader title="Bestellungen" />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          className="w-full rounded-lg border px-3 py-2.5 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setSkip(0); }}
        >
          <option value="">Alle Status</option>
          {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border px-3 py-2.5 text-sm"
          value={storeId}
          onChange={(e) => { setStoreId(Number(e.target.value)); setSkip(0); }}
        >
          <option value={0}>Alle Shops</option>
          {(storesData?.data ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <DataTable
        isLoading={isLoading}
        keyField="id"
        columns={[
          { key: 'id', header: '#' },
          { key: 'customer', header: 'Kunde' },
          { key: 'total', header: 'Summe' },
          { key: 'payment', header: 'Zahlung' },
          { key: 'stores', header: 'Shops' },
          { key: 'actions', header: '' },
        ]}
        rows={rows}
      />
      {data?.meta ? <Pagination meta={data.meta} onPageChange={setSkip} /> : null}
    </div>
  );
}
