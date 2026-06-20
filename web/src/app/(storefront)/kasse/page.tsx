'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { Button, Input, PageHeader } from '@/components/ui';

interface CartSummaryData {
  grandSubtotal: number;
  grandShipping: number;
  grandTax: number;
  grandTotal: number;
}

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [form, setForm] = useState({
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'DE',
  });
  const [error, setError] = useState('');

  const { data: summary } = useQuery({
    queryKey: ['cart-summary', user?.id],
    enabled: !!user,
    queryFn: () => apiFetch<{ data: CartSummaryData }>(`/cart/${user!.id}/summary`),
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      apiFetch(`/orders/${user!.id}`, {
        method: 'POST',
        body: JSON.stringify(form),
      }),
    onSuccess: () => router.push('/bestellungen'),
    onError: (e: Error) => setError(e.message),
  });

  if (!user) {
    return <PageHeader title="Kasse" subtitle="Bitte melden Sie sich an." />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <PageHeader title="Lieferadresse" />
        <div className="space-y-4">
          <Input placeholder="Straße und Hausnummer" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
          <Input placeholder="Stadt" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input placeholder="Bundesland" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Input placeholder="PLZ" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          <Input placeholder="Land" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-[#001529]">Zusammenfassung</h2>
        {summary?.data ? (
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Zwischensumme</dt><dd>{summary.data.grandSubtotal.toFixed(2)} €</dd></div>
            <div className="flex justify-between"><dt>Versand</dt><dd>{summary.data.grandShipping.toFixed(2)} €</dd></div>
            <div className="flex justify-between"><dt>MwSt.</dt><dd>{summary.data.grandTax.toFixed(2)} €</dd></div>
            <div className="flex justify-between border-t pt-2 font-semibold"><dt>Gesamt</dt><dd>{summary.data.grandTotal.toFixed(2)} €</dd></div>
          </dl>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <Button className="mt-6 w-full" onClick={() => placeOrder.mutate()} disabled={placeOrder.isPending}>
          Bestellung aufgeben (B2B)
        </Button>
      </div>
    </div>
  );
}
