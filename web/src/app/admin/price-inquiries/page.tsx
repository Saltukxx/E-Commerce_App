'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, PageHeader, Textarea } from '@/components/ui';
import { adminPriceInquiries } from '@/lib/panel-api';
import { StatusBadge } from '@/components/panels/status-badge';
import { EuroInput, formatEuroFromCents } from '@/components/panels/euro-input';
import { PanelAlert, EmptyState } from '@/components/panels/panel-feedback';

export default function AdminPriceInquiriesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [quoteId, setQuoteId] = useState<number | null>(null);
  const [quoteCents, setQuoteCents] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-price-inquiries'],
    queryFn: () => adminPriceInquiries.list(),
  });

  const update = useMutation({
    mutationFn: (payload: { id: number; status: string; quoteCents?: number; adminNote?: string }) =>
      adminPriceInquiries.update(payload.id, {
        status: payload.status,
        quoteCents: payload.quoteCents,
        adminNote: payload.adminNote,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-price-inquiries'] });
      setQuoteId(null);
      setQuoteCents(0);
      setNote('');
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const rows = (data?.data ?? []).filter((r) => filter === 'all' || r.status === filter);

  return (
    <div>
      <PageHeader title="Preisanfragen" />
      {error ? <PanelAlert tone="error" className="mb-4">{error}</PanelAlert> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {['pending', 'quoted', 'closed', 'all'].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? 'primary' : 'secondary'} onClick={() => setFilter(s)}>
            {s}
          </Button>
        ))}
      </div>
      {isLoading ? <p className="text-sm text-gray-500">Laden…</p> : null}
      {!isLoading && rows.length === 0 ? <EmptyState title="Keine Preisanfragen" /> : null}
      <div className="space-y-4">
        {rows.map((inq) => (
          <div key={inq.id} className="rounded-2xl border bg-white p-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div>
                <Link href={`/produkt/${inq.product.slug}`} className="font-semibold text-[#001529] hover:underline">
                  {inq.product.title}
                </Link>
                <p className="text-sm text-gray-600">{inq.productName}</p>
                {inq.store ? (
                  <Link href={`/admin/stores/${inq.store.id}`} className="text-sm text-gray-500 hover:underline">
                    Shop: {inq.store.name}
                  </Link>
                ) : null}
                <p className="mt-1 text-sm text-gray-600">{inq.user.name} · {inq.user.email}</p>
                <p className="text-xs text-gray-400">{new Date(inq.createdAt).toLocaleString('de-DE')}</p>
                {inq.adminNote ? <p className="mt-2 text-sm text-gray-700">Notiz: {inq.adminNote}</p> : null}
                {inq.quoteCents ? (
                  <p className="mt-2 text-sm font-semibold">Angebot: {formatEuroFromCents(inq.quoteCents)}</p>
                ) : null}
              </div>
              <StatusBadge status={inq.status} kind="inquiry" />
            </div>
            {inq.status === 'pending' ? (
              quoteId === inq.id ? (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <EuroInput label="Angebotspreis" valueCents={quoteCents} onChangeCents={setQuoteCents} />
                  <Textarea rows={2} placeholder="Notiz an Kunden" value={note} onChange={(e) => setNote(e.target.value)} />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      size="sm"
                      onClick={() => update.mutate({ id: inq.id, status: 'quoted', quoteCents, adminNote: note })}
                      disabled={update.isPending || quoteCents <= 0}
                    >
                      Angebot senden
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setQuoteId(null)}>Abbrechen</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button size="sm" onClick={() => setQuoteId(inq.id)}>Angebot erstellen</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => update.mutate({ id: inq.id, status: 'closed' })}
                  >
                    Schließen
                  </Button>
                </div>
              )
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
