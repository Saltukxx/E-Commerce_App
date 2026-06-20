'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, PageHeader } from '@/components/ui';
import { vendorFinance, vendorStore } from '@/lib/panel-api';
import { formatEuroFromCents } from '@/components/panels/euro-input';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { VendorSuspendedAlert } from '@/components/vendor/vendor-suspended-alert';
import { DataTable } from '@/components/panels/data-table';
import { PanelAlert } from '@/components/panels/panel-feedback';

export default function VendorFinancePage() {
  const qc = useQueryClient();
  const [amountEur, setAmountEur] = useState('');
  const [iban, setIban] = useState('');
  const [holder, setHolder] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const { data: storeData } = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const suspended = storeData?.data?.status === 'suspended';
  const store = storeData?.data;

  const summaryQuery = useQuery({ queryKey: ['vendor-finance-summary'], queryFn: () => vendorFinance.summary() });
  const ledgerQuery = useQuery({ queryKey: ['vendor-finance-ledger'], queryFn: () => vendorFinance.ledger() });
  const requestsQuery = useQuery({ queryKey: ['vendor-payout-requests'], queryFn: () => vendorFinance.payoutRequests() });

  useEffect(() => {
    if (!store) return;
    setIban(store.payoutBankIban ?? '');
    setHolder(store.payoutBankHolder ?? '');
  }, [store]);

  const summary = summaryQuery.data?.data;
  const ledger = ledgerQuery.data?.data ?? [];
  const requests = requestsQuery.data?.data ?? [];

  const createPayout = useMutation({
    mutationFn: () =>
      vendorFinance.createPayout({
        amountCents: Math.round(parseFloat(amountEur.replace(',', '.')) * 100),
        bankIban: iban || store?.payoutBankIban || '',
        bankHolder: holder || store?.payoutBankHolder || '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-finance-summary'] });
      qc.invalidateQueries({ queryKey: ['vendor-payout-requests'] });
      qc.invalidateQueries({ queryKey: ['vendor-finance-ledger'] });
      setMessage('Auszahlungsantrag eingereicht.');
      setAmountEur('');
    },
    onError: (e: Error) => setMessage(e.message),
  });

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader title="Finanzen" subtitle="Guthaben & Auszahlungen" />
      {suspended ? <VendorSuspendedAlert /> : null}
      {message ? <PanelAlert tone={message.includes('eingereicht') ? 'success' : 'error'} className="mb-4">{message}</PanelAlert> : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
          <p className="text-sm text-[var(--db-muted)]">Verfügbar</p>
          <p className="text-2xl font-bold">{summary ? formatEuroFromCents(summary.availableCents) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
          <p className="text-sm text-[var(--db-muted)]">Ausstehend</p>
          <p className="text-2xl font-bold">{summary ? formatEuroFromCents(summary.pendingPayoutCents) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
          <p className="text-sm text-[var(--db-muted)]">Gesamt verdient</p>
          <p className="text-2xl font-bold">{summary ? formatEuroFromCents(summary.lifetimeEarnedCents) : '—'}</p>
        </div>
      </div>
      {!suspended ? (
        <div className="mb-8 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 md:p-6">
          <h2 className="mb-4 font-semibold">Auszahlung anfordern</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Betrag (EUR)" value={amountEur} onChange={(e) => setAmountEur(e.target.value)} />
            <Input placeholder="IBAN" value={iban} onChange={(e) => setIban(e.target.value)} />
            <Input placeholder="Kontoinhaber" value={holder} onChange={(e) => setHolder(e.target.value)} className="sm:col-span-2" />
          </div>
          <Button className="mt-4" onClick={() => createPayout.mutate()} disabled={createPayout.isPending || !amountEur}>
            Antrag senden
          </Button>
        </div>
      ) : null}
      <h2 className="mb-4 font-semibold">Auszahlungsanträge</h2>
      <DataTable
        keyField="id"
        columns={[
          { key: 'id', header: '#' },
          { key: 'amount', header: 'Betrag' },
          { key: 'status', header: 'Status' },
          { key: 'date', header: 'Datum' },
        ]}
        rows={requests.map((r) => ({
          id: r.id,
          amount: formatEuroFromCents(r.amountCents),
          status: r.status,
          date: new Date(r.requestedAt).toLocaleDateString('de-DE'),
        }))}
        emptyTitle="Keine Anträge"
      />
      <h2 className="mb-4 mt-8 font-semibold">Kontobewegungen</h2>
      <DataTable
        keyField="id"
        columns={[
          { key: 'type', header: 'Typ' },
          { key: 'amount', header: 'Betrag' },
          { key: 'note', header: 'Notiz' },
          { key: 'date', header: 'Datum' },
        ]}
        rows={ledger.map((e) => ({
          id: e.id,
          type: e.type,
          amount: formatEuroFromCents(e.amountCents),
          note: e.note,
          date: new Date(e.createdAt).toLocaleDateString('de-DE'),
        }))}
        emptyTitle="Noch keine Buchungen"
      />
    </div>
  );
}
