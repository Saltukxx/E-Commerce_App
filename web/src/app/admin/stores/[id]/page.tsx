'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, PageHeader, Textarea } from '@/components/ui';
import { adminProducts, adminStores } from '@/lib/panel-api';
import { ImageUploadField } from '@/components/panels/image-upload-field';
import { PanelAlert } from '@/components/panels/panel-feedback';
import { StatusBadge } from '@/components/panels/status-badge';

export default function AdminStoreDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    contactEmail: '',
    phone: '',
    deliveryArea: '',
    city: '',
    website: '',
    isFeatured: false,
    featuredProductIds: [] as number[],
  });
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const { data } = useQuery({
    queryKey: ['admin-store', id],
    queryFn: () => adminStores.get(id),
    enabled: Number.isFinite(id),
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products', id],
    queryFn: () => adminProducts.list({ storeId: id, limit: 100 }),
    enabled: Number.isFinite(id),
  });

  const store = data?.data;

  useEffect(() => {
    if (!store) return;
    setForm({
      name: store.name,
      description: store.description,
      logo: store.logo,
      banner: store.banner,
      contactEmail: store.contactEmail,
      phone: store.phone,
      deliveryArea: store.deliveryArea,
      city: store.city,
      website: store.website,
      isFeatured: store.isFeatured,
      featuredProductIds: store.featuredProductIds ?? [],
    });
  }, [store]);

  const save = useMutation({
    mutationFn: () => adminStores.update(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-store', id] });
      setMessage({ tone: 'success', text: 'Shop gespeichert.' });
    },
    onError: (e: Error) => setMessage({ tone: 'error', text: e.message }),
  });

  const toggleStatus = useMutation({
    mutationFn: () =>
      adminStores.updateStatus(id, store?.status === 'active' ? 'suspended' : 'active'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-store', id] }),
  });

  const stripeOnboard = useMutation({
    mutationFn: () => adminStores.stripeOnboard(id),
    onSuccess: (res) => setStripeUrl(res.data.onboardingUrl),
  });

  const stripeSync = useMutation({
    mutationFn: () => adminStores.stripeSync(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-store', id] });
      setMessage({ tone: 'success', text: 'Stripe-Status synchronisiert.' });
    },
  });

  if (!store) return <p>Laden…</p>;

  const products = productsData?.data ?? [];

  return (
    <div>
      <PageHeader
        title={store.name}
        subtitle={`/${store.slug}`}
        action={
          <Link href="/admin/stores">
            <Button variant="secondary">Zurück</Button>
          </Link>
        }
      />
      {message ? (
        <PanelAlert tone={message.tone} className="mb-6">
          {message.text}
        </PanelAlert>
      ) : null}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={store.status} kind="store" />
        <Button size="sm" variant="ghost" onClick={() => toggleStatus.mutate()}>
          {store.status === 'active' ? 'Sperren' : 'Aktivieren'}
        </Button>
      </div>
      {store.owner ? (
        <p className="mb-6 text-sm text-gray-600">
          Inhaber: {store.owner.name} ({store.owner.email})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-white p-4 md:p-6">
          <h2 className="font-semibold">Profil</h2>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
          <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Beschreibung" />
          <ImageUploadField label="Logo" value={form.logo} onChange={(logo) => setForm({ ...form, logo })}           uploadPath="admin/uploads/product-image" />
          <ImageUploadField label="Banner" value={form.banner} onChange={(banner) => setForm({ ...form, banner })} uploadPath="admin/uploads/store-banner" />
          <Input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="E-Mail" />
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefon" />
          <Input value={form.deliveryArea} onChange={(e) => setForm({ ...form, deliveryArea: e.target.value })} placeholder="Liefergebiet" />
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Stadt" />
          <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured Shop
          </label>
          <div>
            <p className="mb-2 text-sm font-medium">Featured Produkte</p>
            <div className="max-h-40 space-y-1 overflow-y-auto text-sm">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featuredProductIds.includes(p.id)}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        featuredProductIds: e.target.checked
                          ? [...form.featuredProductIds, p.id].slice(0, 8)
                          : form.featuredProductIds.filter((x) => x !== p.id),
                      });
                    }}
                  />
                  {p.title}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Speichern
          </Button>
        </div>
        <div className="space-y-4 rounded-2xl border bg-white p-4 md:p-6">
          <h2 className="font-semibold">Stripe</h2>
          <p className="text-sm text-gray-600">
            Onboarding: {store.stripeOnboardingComplete ? 'Abgeschlossen' : 'Offen'} · Auszahlungen:{' '}
            {store.payoutsEnabled ? 'Aktiv' : 'Inaktiv'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => stripeOnboard.mutate()} disabled={stripeOnboard.isPending}>
              Onboarding-Link
            </Button>
            <Button size="sm" variant="secondary" onClick={() => stripeSync.mutate()}>
              Status sync
            </Button>
          </div>
          {stripeUrl ? (
            <PanelAlert tone="info">
              <a href={stripeUrl} target="_blank" rel="noreferrer" className="underline">
                Stripe Onboarding öffnen
              </a>
            </PanelAlert>
          ) : null}
          <p className="text-sm text-gray-500">
            {store.productCount ?? 0} Produkte · {store.orderCount ?? 0} Bestellungen
          </p>
        </div>
      </div>
    </div>
  );
}
