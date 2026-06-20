'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, PageHeader, Textarea } from '@/components/ui';
import { adminPayouts } from '@/lib/panel-api';
import { formatEuroFromCents } from '@/components/panels/euro-input';
import { DataTable } from '@/components/panels/data-table';
import { PanelAlert } from '@/components/panels/panel-feedback';
import { StatusBadge } from '@/components/panels/status-badge';

const FILTERS = [
  { value: 'pending', label: 'Ausstehend' },
  { value: 'approved', label: 'Genehmigt' },
  { value: 'paid', label: 'Bezahlt' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: '', label: 'Alle' },
];

export default function AdminPayoutRequestsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [note, setNote] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payout-requests', filter],
    queryFn: () => adminPayouts.list(filter || undefined),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminPayouts.update(id, { status, adminNote: note || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payout-requests'] });
      setActiveId(null);
      setNote('');
      setMessage('Aktualisiert.');
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const rows = (data?.data ?? []).map((r) => ({
    id: r.id,
    store: r.store?.name ?? `#${r.storeId}`,
    amount: formatEuroFromCents(r.amountCents),
    iban: r.bankIban,
    holder: r.bankHolder,
    status: <StatusBadge status={r.status} kind="payout" />,
    date: new Date(r.requestedAt).toLocaleDateString('de-DE'),
    actions:
      r.status === 'pending' || r.status === 'approved' ? (
        activeId === r.id ? (
          <div className="space-y-2">
            <Textarea rows={2} placeholder="Admin-Notiz" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {r.status === 'pending' ? (
                <>
                  <Button size="sm" onClick={() => update.mutate({ id: r.id, status: 'approved' })}>Genehmigen</Button>
                  <Button size="sm" variant="danger" onClick={() => update.mutate({ id: r.id, status: 'rejected' })}>Ablehnen</Button>
                </>
              ) : null}
              {r.status === 'approved' ? (
                <Button size="sm" onClick={() => update.mutate({ id: r.id, status: 'paid' })}>Als bezahlt markieren</Button>
              ) : null}
              <Button size="sm" variant="secondary" onClick={() => setActiveId(null)}>Abbrechen</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setActiveId(r.id)}>Bearbeiten</Button>
        )
      ) : null,
  }));

  return (
    <div>
      <PageHeader title="Auszahlungen" subtitle="Händler-Auszahlungsanträge" />
      {message ? <PanelAlert tone="success" className="mb-4">{message}</PanelAlert> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f.value || 'all'} size="sm" variant={filter === f.value ? 'primary' : 'secondary'} onClick={() => setFilter(f.value)}>
            {f.label}
          </Button>
        ))}
      </div>
      <DataTable
        isLoading={isLoading}
        keyField="id"
        columns={[
          { key: 'id', header: '#' },
          { key: 'store', header: 'Shop' },
          { key: 'amount', header: 'Betrag' },
          { key: 'iban', header: 'IBAN' },
          { key: 'holder', header: 'Inhaber' },
          { key: 'status', header: 'Status' },
          { key: 'date', header: 'Datum' },
          { key: 'actions', header: '' },
        ]}
        rows={rows}
        emptyTitle="Keine Auszahlungsanträge"
      />
    </div>
  );
}
