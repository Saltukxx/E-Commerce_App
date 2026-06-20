'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { PageHeader, Badge } from '@/components/ui';

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    enabled: !!user,
    queryFn: () => apiFetch<{ data: Array<{
      orderGroupId: number | null;
      orderDate: string;
      grandTotal: number;
      orders: Array<{ orderId: number; storeName: string; status: string; totalAmount: number; items: Array<{ productName: string; quantity: number }> }>;
    }> }>(`/orders/${user!.id}`),
  });

  if (!user) return <PageHeader title="Bestellungen" subtitle="Bitte melden Sie sich an." />;

  return (
    <div>
      <PageHeader title="Meine Bestellungen" />
      {isLoading ? <p>Laden…</p> : null}
      <div className="space-y-4">
        {(data?.data ?? []).map((group, idx) => (
          <div key={`${group.orderGroupId}-${idx}`} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-[#001529]">{group.orderDate}</p>
              <p className="font-medium">{group.grandTotal.toFixed(2)} €</p>
            </div>
            {group.orders.map((order) => (
              <div key={order.orderId} className="mt-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.storeName}</p>
                  <Badge>{order.status}</Badge>
                </div>
                <ul className="mt-2 text-sm text-gray-600">
                  {order.items.map((item, i) => (
                    <li key={i}>{item.quantity}× {item.productName}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
