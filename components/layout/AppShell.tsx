import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { AppTopbar } from './MobileTopbar';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  variant?: 'app' | 'admin';
}

export function AppShell({ children, variant = 'app' }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-alt">
      <Sidebar variant={variant} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar variant={variant} />
        {/* pad-safe-bottom = clearance above floating mobile bottom nav (incl. iOS safe-area). */}
        <main className="pad-safe-bottom flex-1">{children}</main>
      </div>
      <BottomNav variant={variant} />
    </div>
  );
}
