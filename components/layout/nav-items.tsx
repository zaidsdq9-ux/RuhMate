import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icons';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  match?: (path: string) => boolean;
}

export const APP_NAV: NavItem[] = [
  {
    href: '/feed',
    label: 'Discover',
    icon: <Icon.Search size={20} />,
    match: (p) =>
      p === '/feed' || (p.startsWith('/profile/') && p !== '/profile/me'),
  },
  {
    href: '/matches',
    label: 'My matches',
    icon: <Icon.HeartFill size={20} />,
    match: (p) => p.startsWith('/matches'),
  },
  {
    href: '/profile/me',
    label: 'My profile',
    icon: <Icon.User size={20} />,
    match: (p) => p === '/profile/me',
  },
  {
    href: '/wallet',
    label: 'Wallet',
    icon: <Icon.Wallet size={20} />,
    match: (p) => p.startsWith('/wallet') || p.startsWith('/buy'),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Icon.Settings size={20} />,
    match: (p) => p.startsWith('/settings'),
  },
];

export const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin/users',
    label: 'Users',
    icon: <Icon.User size={20} />,
    match: (p) => p.startsWith('/admin/users'),
  },
  {
    href: '/admin/transactions',
    label: 'Transactions',
    icon: <Icon.Wallet size={20} />,
    match: (p) => p.startsWith('/admin/transactions'),
  },
  {
    href: '/admin/unlocks',
    label: 'Unlocks',
    icon: <Icon.Lock size={20} />,
    match: (p) => p.startsWith('/admin/unlocks'),
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: <Icon.Settings size={20} />,
    match: (p) => p.startsWith('/admin/settings'),
  },
  {
    href: '/admin/audit',
    label: 'Audit log',
    icon: <Icon.Shield size={20} />,
    match: (p) => p.startsWith('/admin/audit'),
  },
];
