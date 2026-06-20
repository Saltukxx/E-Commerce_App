'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, PageHeader, Textarea } from '@/components/ui';
import { vendorStore, vendorProducts } from '@/lib/panel-api';
import { ImageUploadField } from '@/components/panels/image-upload-field';
import { PanelAlert } from '@/components/panels/panel-feedback';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { VendorSuspendedAlert } from '@/components/vendor/vendor-suspended-alert';
import { VendorStorePreviewPanel } from '@/components/vendor/store-preview-panel';

const CERT_PRESETS = ['F-Gas zertifiziert', 'Meisterbetrieb', 'VDE geprüft'];

export default function VendorStorePage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['vendor-store'],
    queryFn: () => vendorStore.get(),
  });

  const { data: productsData } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => vendorProducts.list({ limit: 100 }),
  });

  const store = data?.data;
  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const suspended = store?.status === 'suspended';

  const [form, setForm] = useState({
    description: '',
    logo: '',
    banner: '',
    contactEmail: '',
    phone: '',
    deliveryArea: '',
    city: '',
    website: '',
    certifications: [] as string[],
    featuredProductIds: [] as number[],
    certInput: '',
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    setForm((prev) => ({
      ...prev,
      description: store.description ?? '',
      logo: store.logo ?? '',
      banner: store.banner ?? '',
      contactEmail: store.contactEmail ?? '',
      phone: store.phone ?? '',
      deliveryArea: store.deliveryArea ?? '',
      city: store.city ?? '',
      website: store.website ?? '',
      certifications: store.certifications ?? [],
      featuredProductIds: store.featuredProductIds ?? [],
    }));
  }, [store]);

  const featuredProducts = useMemo(
    () => products.filter((p) => form.featuredProductIds.includes(p.id)),
    [products, form.featuredProductIds],
  );

  const save = useMutation({
    mutationFn: () =>
      vendorStore.update({
        description: form.description,
        logo: form.logo,
        banner: form.banner,
        contactEmail: form.contactEmail,
        phone: form.phone,
        deliveryArea: form.deliveryArea,
        city: form.city,
        website: form.website,
        certifications: form.certifications,
        featuredProductIds: form.featuredProductIds,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-store'] });
      setMessage('Profil gespeichert.');
    },
    onError: (e: Error) => setMessage(e.message),
  });

  function toggleFeatured(productId: number) {
    setForm((prev) => {
      const selected = prev.featuredProductIds.includes(productId)
        ? prev.featuredProductIds.filter((id) => id !== productId)
        : prev.featuredProductIds.length >= 8
          ? prev.featuredProductIds
          : [...prev.featuredProductIds, productId];
      return { ...prev, featuredProductIds: selected };
    });
  }

  function addCertification(value: string) {
    const trimmed = value.trim();
    if (!trimmed || form.certifications.includes(trimmed)) return;
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, trimmed],
      certInput: '',
    }));
  }

  if (!store) return <p className="text-sm text-[var(--db-muted)]">Laden…</p>;

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader title="Shop-Profil" subtitle={store.name} />
      {suspended ? <VendorSuspendedAlert /> : null}
      {message ? (
        <PanelAlert tone={message.includes('gespeichert') ? 'success' : 'error'} className="mb-4">
          {message}
        </PanelAlert>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 md:p-6">
          <Textarea
            placeholder="Beschreibung"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={suspended}
          />
          <ImageUploadField
            label="Logo"
            value={form.logo}
            onChange={(logo) => setForm({ ...form, logo })}
            uploadPath="vendor/uploads/product-image"
          />
          <ImageUploadField
            label="Banner"
            value={form.banner}
            onChange={(banner) => setForm({ ...form, banner })}
            uploadPath="vendor/uploads/store-banner"
          />
          <Input placeholder="Liefergebiet" value={form.deliveryArea} onChange={(e) => setForm({ ...form, deliveryArea: e.target.value })} disabled={suspended} />
          <Input placeholder="Stadt" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={suspended} />
          <Input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} disabled={suspended} />
          <Input placeholder="Kontakt E-Mail" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} disabled={suspended} />
          <Input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={suspended} />

          <div>
            <p className="mb-2 text-sm font-medium">Zertifikate</p>
            <div className="mb-2 flex flex-wrap gap-2">
              {form.certifications.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  className="rounded-full bg-[#E6F4FF] px-3 py-1 text-xs font-medium text-[#001529]"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      certifications: prev.certifications.filter((c) => c !== cert),
                    }))
                  }
                >
                  {cert} ×
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {CERT_PRESETS.map((preset) => (
                <button key={preset} type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => addCertification(preset)}>
                  + {preset}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input placeholder="Eigenes Zertifikat" value={form.certInput} onChange={(e) => setForm({ ...form, certInput: e.target.value })} />
              <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={() => addCertification(form.certInput)}>Hinzufügen</Button>
            </div>
          </div>

          {products.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium">Highlights (max. 8)</p>
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border p-3">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.featuredProductIds.includes(product.id)}
                      onChange={() => toggleFeatured(product.id)}
                      disabled={suspended}
                    />
                    <span className="line-clamp-1">{product.title}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <Button onClick={() => save.mutate()} disabled={save.isPending || suspended}>
            Speichern
          </Button>
        </div>

        <VendorStorePreviewPanel store={store} form={form} featuredProducts={featuredProducts} />
      </div>
    </div>
  );
}
