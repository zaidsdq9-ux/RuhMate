import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
            RuhMate
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-surface-blush">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="font-display text-5xl leading-tight tracking-tight text-ink md:text-6xl">
            Discreet matches. <br />
            Family-first matrimonial.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-muted">
            Browse anonymous profiles by index number. Reveal contact only when you find the right
            match. No photos, no chat — just thoughtful introductions, the way families have always
            done it.
          </p>
          <div className="mt-10 flex gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Create your free profile</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl text-ink">No photos, no pressure</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Profiles are anonymous by design. Browse by index number. Make decisions on substance,
              not appearance.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">Reveal contact when ready</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Spend points to unlock phone and WhatsApp. Points are bought in packs and never expire.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">AI-ranked matches</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Describe what you&apos;re looking for in your own words. We surface the closest fits
              at the top of your feed.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-ink-muted">
          <p>© {new Date().getFullYear()} RuhMate</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
