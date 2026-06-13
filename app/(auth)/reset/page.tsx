export const metadata = { title: 'Reset password — RuhMate' };

export default function ResetPage() {
  return (
    <div className="rounded-card border border-line bg-white p-6 text-sm text-ink">
      <h1 className="font-display text-2xl text-ink">Password reset</h1>
      <p className="mt-2 text-ink-muted">
        Password resets are completed through the link in your email. Open that link to choose a new
        password.
      </p>
      <p className="mt-4 text-ink-muted">
        If the link expired,{' '}
        <a href="/forgot" className="text-accent hover:underline">
          request a new one
        </a>
        .
      </p>
    </div>
  );
}
