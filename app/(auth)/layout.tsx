import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-blush">
      <header className="px-6 py-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          RuhMate
        </Link>
      </header>
      <main className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-10">{children}</main>
    </div>
  );
}
