import { requireAdmin } from '@/lib/auth/server';
import { AppShell } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin('/admin');
  return <AppShell variant="admin">{children}</AppShell>;
}
