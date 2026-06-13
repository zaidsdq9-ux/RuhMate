interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
}

export function ScoreRing({ score, size = 44, stroke = 4 }: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (score / 100);
  const gradId = `scoreG-${size}-${score}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 800ms cubic-bezier(0.16,1,0.3,1)' }}
        />
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--rose)" />
            <stop offset="100%" stopColor="var(--rose-deep)" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute inset-0 grid place-items-center font-semibold text-rose-deep"
        style={{ fontSize: Math.max(10, size * 0.25) }}
      >
        {score}
      </div>
    </div>
  );
}
