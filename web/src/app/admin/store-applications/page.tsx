'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, PageHeader, Textarea } from '@/components/ui';
import { adminApplications } from '@/lib/panel-api';
import { PanelAlert, EmptyState } from '@/components/panels/panel-feedback';
import { ConfirmDialog } from '@/components/panels/confirm-dialog';
import { StatusBadge } from '@/components/panels/status-badge';

const TABS = [
  { value: 'pending', label: 'Ausstehend' },
  { value: 'approved', label: 'Genehmigt' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'all', label: 'Alle' },
];

export default function AdminApplicationsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvedCreds, setApprovedCreds] = useState<{
    email: string;
    tempPassword?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', status],
    queryFn: () => adminApplications.list(status),
  });

  const approve = useMutation({
    mutationFn: (id: number) => adminApplications.approve(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] });
      setError(null);
      setApprovedCreds({
        email: res.data.vendorEmail,
        tempPassword: res.data.tempPassword,
      });
    },
    onError: (e: Error) => setError(e.message),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApplications.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] });
      setRejectId(null);
      setRejectReason('');
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const apps = data?.data ?? [];

  async function copyCredentials() {
    if (!approvedCreds) return;
    const text = approvedCreds.tempPassword
      ? `E-Mail: ${approvedCreds.email}\nPasswort: ${approvedCreds.tempPassword}`
      : approvedCreds.email;
    await navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <PageHeader title="Händlerbewerbungen" />
      {error ? <PanelAlert tone="error" className="mb-4">{error}</PanelAlert> : null}
      {approvedCreds ? (
        <PanelAlert tone="success" className="mb-6">
          <p className="font-semibold">Bewerbung genehmigt</p>
          <p className="mt-1">E-Mail: {approvedCreds.email}</p>
          {approvedCreds.tempPassword ? (
            <p className="mt-1 font-mono text-sm">Temporäres Passwort: {approvedCreds.tempPassword}</p>
          ) : (
            <p className="mt-1 text-sm">Bestehender Benutzer — kein neues Passwort.</p>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button size="sm" variant="secondary" onClick={() => void copyCredentials()}>
              Kopieren
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setApprovedCreds(null)}>
              Schließen
            </Button>
          </div>
        </PanelAlert>
      ) : null}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={status === tab.value ? 'primary' : 'secondary'}
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {isLoading ? <p className="text-sm text-gray-500">Laden…</p> : null}
      {!isLoading && apps.length === 0 ? (
        <EmptyState title="Keine Bewerbungen in dieser Ansicht" />
      ) : null}
      <div className="space-y-4">
        {apps.map((app) => (
          <div key={app.id} className="rounded-2xl border bg-white p-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-[#001529]">{app.businessName}</p>
                <p className="text-sm text-gray-600">
                  {app.contactName} · {app.contactEmail} · {app.phone || '—'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(app.createdAt).toLocaleString('de-DE')}
                </p>
                {app.message ? <p className="mt-2 text-sm">{app.message}</p> : null}
                {app.rejectionReason ? (
                  <p className="mt-2 text-sm text-red-600">Grund: {app.rejectionReason}</p>
                ) : null}
              </div>
              <StatusBadge status={app.status} kind="application" />
            </div>
            {app.status === 'pending' ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button size="sm" onClick={() => approve.mutate(app.id)} disabled={approve.isPending}>
                  Genehmigen
                </Button>
                <Button size="sm" variant="danger" onClick={() => setRejectId(app.id)}>
                  Ablehnen
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={rejectId != null}
        title="Bewerbung ablehnen"
        description="Der Ablehnungsgrund wird für Ihre Unterlagen gespeichert."
        confirmLabel="Ablehnen"
        danger
        loading={reject.isPending}
        onCancel={() => {
          setRejectId(null);
          setRejectReason('');
        }}
        onConfirm={() => {
          if (rejectId == null) return;
          reject.mutate({ id: rejectId, reason: rejectReason.trim() || 'Abgelehnt' });
        }}
      >
        <Textarea
          rows={3}
          placeholder="Ablehnungsgrund…"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
}
