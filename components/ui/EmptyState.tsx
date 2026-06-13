import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  desc?: string;
  cta?: ReactNode;
}

export function EmptyState({ icon, title, desc, cta }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-line bg-white px-6 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-pill bg-rose-soft text-rose-deep">
        {icon}
      </div>
      <h3 className="display mt-5 text-2xl text-ink">{title}</h3>
      {desc && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{desc}</p>
      )}
      {cta && <div className="mt-5 inline-flex">{cta}</div>}
    </div>
  );
}
