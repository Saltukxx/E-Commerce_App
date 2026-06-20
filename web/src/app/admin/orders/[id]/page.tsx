'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, PageHeader, Card } from '@/components/ui';
import { adminOrders } from '@/lib/panel-api';
import { StatusBadge } from '@/components/panels/status-badge';
import { formatEuroFromCents } from '@/components/panels/euro-input';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminOrders.get(id),
    enabled: Number.isFinite(id),
  });

  const order = data?.data;

  if (isLoading) return <p>Laden…</p>;
  if (!order) return <p>Bestellung nicht gefunden.</p>;

  return (
    <div>
      <PageHeader
        title={`Bestellung #${order.orderGroupId}`}
        action={
          <Link href="/admin/orders">
            <Button variant="secondary">Zurück</Button>
          </Link>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-gray-500">Kunde</p>
          <p className="font-semibold">{order.user.name}</p>
          <p className="text-sm text-gray-600">{order.user.email}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Lieferadresse</p>
          <p className="text-sm">
            {order.addressLine}, {order.postalCode} {order.city}, {order.country}
          </p>
          <p className="mt-2">
            Summe: {order.grandTotal.toFixed(2)} € ·{' '}
            <StatusBadge status={order.paymentStatus} kind="payment" />
          </p>
        </Card>
      </div>
      <div className="space-y-4">
        {order.orders.map((sub) => (
          <Card key={sub.orderId}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{sub.store.name}</p>
              <StatusBadge status={sub.status} kind="order" />
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {sub.items.map((line) => (
                <li key={line.id} className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span>{line.quantity}× {line.productName}</span>
                  <span>{formatEuroFromCents(line.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-semibold">Teilsumme: {sub.totalAmount.toFixed(2)} €</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
