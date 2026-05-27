import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'RuhMate — Discreet, family-first matrimonial matching',
  description:
    'Anonymous matrimonial profiles. Soft, premium, designed for families. Reveal contact only when you find the right match.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, fraunces.variable)}>
      <body>{children}</body>
    </html>
  );
}
