import type { ReactNode } from 'react';

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <div className="display text-lg text-ink">{title}</div>
      {subtitle && <div className="mt-0.5 text-xs text-ink-muted">{subtitle}</div>}
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-ink">{value || '—'}</div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function DividerRose({ children }: { children?: ReactNode }) {
  return (
    <div className="divider-rose">
      {children && <span className="px-2.5">{children}</span>}
    </div>
  );
}

export function ChipDot() {
  return <span className="chip-dot" />;
}
