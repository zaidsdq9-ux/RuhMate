export const dynamic = 'force-dynamic';

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-blush px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-ink">We&apos;ll be right back</h1>
        <p className="mt-3 text-ink-muted">
          RuhMate is briefly down for maintenance. Please check back in a few minutes.
        </p>
      </div>
    </main>
  );
}
