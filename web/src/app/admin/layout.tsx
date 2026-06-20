import { RequireRole } from '@/components/auth/require-role';
import { AdminSidebar, PanelShell, adminLinks } from '@/components/panels/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="admin">
      <PanelShell sidebar={<AdminSidebar />} mobileTitle="Admin" mobileLinks={adminLinks}>
        {children}
      </PanelShell>
    </RequireRole>
  );
}
