import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { Footer } from '@/components/layout/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <MarketingHeader />
      <main className="rm-zoomable">{children}</main>
      <Footer />
    </div>
  );
}
