import { RequireRole } from '@/components/auth/require-role';
import { VendorShell } from '@/components/vendor/vendor-shell';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="vendor">
      <VendorShell>{children}</VendorShell>
    </RequireRole>
  );
}
