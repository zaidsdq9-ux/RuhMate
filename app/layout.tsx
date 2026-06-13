import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

// Single clean, modern sans across the whole platform (client request, May 2026).
// Montserrat is a variable font on Google Fonts, so one instance covers every
// weight we use for body, headings, and numbers.
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ruh-mate.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'RuhMate — Discreet, family-first matrimonial matching',
    template: '%s | RuhMate',
  },
  description:
    'Anonymous matrimonial profiles. Soft, premium, designed for families. Reveal contact only when you find the right match.',
  applicationName: 'RuhMate',
  keywords: [
    'matrimonial',
    'Sri Lanka',
    'marriage',
    'matchmaking',
    'family',
    'anonymous',
    'AI matching',
  ],
  openGraph: {
    type: 'website',
    siteName: 'RuhMate',
    title: 'RuhMate — Discreet, family-first matrimonial matching',
    description:
      'Browse anonymous profiles. Reveal contact only when you find the right match.',
    url: APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RuhMate',
    description: 'Discreet, family-first matrimonial matching.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(montserrat.variable)}>
      <body>{children}</body>
    </html>
  );
}
