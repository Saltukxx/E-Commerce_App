'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { Button, Input, PageHeader, Textarea } from '@/components/ui';

export default function StoreApplicationPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    contactName: user?.name ?? '',
    contactEmail: user?.email ?? '',
    phone: '',
    message: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await apiFetch('/store-applications', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Bewerbung eingereicht. Wir melden uns in Kürze.');
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Händler werden" subtitle="Eröffnen Sie Ihren Shop auf DurmusBaba." />
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6">
        <Input placeholder="Firmenname" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        <Input placeholder="Ansprechpartner" required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        <Input type="email" placeholder="E-Mail" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        <Input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Textarea placeholder="Kurzbeschreibung Ihres Sortiments" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        <Button type="submit" disabled={loading}>Bewerbung senden</Button>
      </form>
    </div>
  );
}
