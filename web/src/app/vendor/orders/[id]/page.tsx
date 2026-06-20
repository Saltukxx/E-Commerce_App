'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, PageHeader, Card } from '@/components/ui';
import { vendorOrders, vendorStore } from '@/lib/panel-api';
import { StatusBadge } from '@/components/panels/status-badge';
import { formatEuroFromCents } from '@/components/panels/euro-input';
import { PanelAlert } from '@/components/panels/panel-feedback';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { VendorSuspendedAlert } from '@/components/vendor/vendor-suspended-alert';

const NEXT_STATUS: Record<string, string> = {
  Pending: 'Confirmed',
  Confirmed: 'Shipped',
  Shipped: 'Delivered',
};

export default function VendorOrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const qc = useQueryClient();

  const { data: storeData } = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const suspended = storeData?.data?.status === 'suspended';

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-order', id],
    queryFn: () => vendorOrders.get(id),
    enabled: Number.isFinite(id),
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => vendorOrders.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-order', id] });
      qc.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });

  const order = data?.data;
  if (isLoading) return <p>Laden…</p>;
  if (!order) return <p>Bestellung nicht gefunden.</p>;

  const addr = order.shippingAddress;

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader
        title={`Bestellung #${order.id}`}
        action={
          <Link href="/vendor/orders">
            <Button variant="secondary">Zurück</Button>
          </Link>
        }
      />
      {suspended ? <VendorSuspendedAlert /> : null}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="border-[var(--db-border)] bg-[var(--db-surface)]">
          <p className="text-sm font-semibold">Kunde</p>
          <p className="mt-2">{order.customer?.name ?? '—'}</p>
          <p className="text-sm text-[var(--db-muted)]">{order.customer?.email ?? ''}</p>
        </Card>
        <Card className="border-[var(--db-border)] bg-[var(--db-surface)]">
          <p className="text-sm font-semibold">Lieferadresse</p>
          {addr ? (
            <p className="mt-2 text-sm">
              {addr.addressLine}<br />
              {addr.postalCode} {addr.city}<br />
              {addr.state ? `${addr.state}, ` : ''}{addr.country}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--db-muted)]">—</p>
          )}
        </Card>
      </div>
      <Card className="mb-6 border-[var(--db-border)] bg-[var(--db-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[var(--db-muted)]">{new Date(order.orderDate).toLocaleString('de-DE')}</p>
          <div className="flex gap-2">
            <StatusBadge status={order.paymentStatus} kind="payment" />
            <StatusBadge status={order.status} kind="order" />
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Zwischensumme</span><span>{order.subtotal.toFixed(2)} €</span></div>
          <div className="flex justify-between"><span>Versand</span><span>{order.shipping.toFixed(2)} €</span></div>
          <div className="flex justify-between"><span>MwSt.</span><span>{order.tax.toFixed(2)} €</span></div>
          <div className="flex justify-between border-t pt-2 font-semibold"><span>Gesamt</span><span>{order.totalAmount.toFixed(2)} €</span></div>
        </div>
      </Card>
      <ul className="mb-6 space-y-2 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 text-sm md:p-6">
        {order.items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <span>{item.quantity}× {item.productName}</span>
            <span>{formatEuroFromCents(item.price)}</span>
          </li>
        ))}
      </ul>
      {!suspended ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {NEXT_STATUS[order.status] ? (
            <Button onClick={() => updateStatus.mutate(NEXT_STATUS[order.status])}>
              Status: {NEXT_STATUS[order.status]}
            </Button>
          ) : null}
          {order.status !== 'Cancelled' && order.status !== 'Delivered' ? (
            <Button variant="danger" onClick={() => updateStatus.mutate('Cancelled')}>
              Stornieren
            </Button>
          ) : null}
        </div>
      ) : (
        <PanelAlert tone="warning">Shop gesperrt — keine Statusänderungen möglich.</PanelAlert>
      )}
    </div>
  );
}
