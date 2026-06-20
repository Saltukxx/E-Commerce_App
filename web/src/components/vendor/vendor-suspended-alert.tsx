'use client';

import { PanelAlert } from '@/components/panels/panel-feedback';

export function VendorSuspendedAlert() {
  return (
    <PanelAlert tone="warning" className="mb-4">
      Ihr Shop ist gesperrt — Änderungen und neue Auszahlungsanträge sind deaktiviert. Bitte kontaktieren
      Sie den Marktplatz-Support.
    </PanelAlert>
  );
}
