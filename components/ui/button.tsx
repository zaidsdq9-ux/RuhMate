'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-btn text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent-hover',
        outline: 'border border-line bg-white text-ink hover:bg-surface-blush',
        ghost: 'text-ink hover:bg-surface-blush',
        link: 'text-accent underline-offset-4 hover:underline',
        success: 'bg-success text-white hover:opacity-90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

type LoadingStyle = 'shimmer' | 'fill';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * When true, shows an in-button loading indicator and prevents clicks.
   * Visual style depends on `loadingStyle`. Ignored when `asChild` is true.
   */
  loading?: boolean;
  /**
   * - 'shimmer' (default): sweeping shimmer overlay + spinner + loadingLabel.
   * - 'fill': replaces the button surface with a light-pink track + advancing
   *           rose bar. Pass `progress` (0-100) to drive it externally; omit
   *           to use the built-in animation that eases 1 → 90.
   */
  loadingStyle?: LoadingStyle;
  /** Label shown while loading. */
  loadingLabel?: string;
  /**
   * External progress override for fill mode (0–100).
   * When provided the internal animation is bypassed.
   * Only complete to 100 after the actual async operation succeeds.
   */
  progress?: number;
}

/**
 * Fallback internal animation used when no external `progress` is supplied.
 * Starts at 1, eases toward 90 (never reaches 100 on its own — the caller
 * must drive it to 100 after the real async work completes).
 */
function useProgressFill(active: boolean): number {
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    if (!active) {
      setPct(0);
      return;
    }
    // Start immediately at 1 so the bar is visible on the first render.
    setPct(1);
    let current = 1;
    const id = setInterval(() => {
      current = Math.min(90, current + (90 - current) * 0.035 + 0.3);
      setPct(Math.floor(current));
      if (current >= 89.8) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [active]);

  return Math.floor(pct);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingStyle = 'shimmer',
      loadingLabel,
      progress,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const internalPct = useProgressFill(
      loading && loadingStyle === 'fill' && progress === undefined,
    );

    if (asChild && !loading) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    // Fill mode — light-pink track + advancing rose bar.
    if (loading && loadingStyle === 'fill') {
      const label = (loadingLabel ?? 'Loading').toUpperCase();
      // External progress takes precedence; clamp to 0-100.
      const displayPct =
        progress !== undefined
          ? Math.round(Math.max(0, Math.min(100, progress)))
          : internalPct;

      return (
        <button
          ref={ref}
          type={props.type ?? 'button'}
          aria-busy
          disabled
          className={cn(
            buttonVariants({ variant, size, className }),
            // Light-pink track, dark text for readability.
            '!bg-rose-soft !text-ink',
          )}
          {...props}
        >
          {/* Rose-pink filled bar */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-rose to-rose-deep motion-safe:transition-[width] motion-safe:duration-[120ms]"
            style={{ width: `${displayPct}%` }}
          />
          <span className="relative z-10 inline-flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink">
            <span>
              {label}
              <span className="ml-1 inline-block">…</span>
            </span>
            <span className="tabular-nums text-ink-muted">{displayPct}%</span>
          </span>
        </button>
      );
    }

    // Shimmer mode (default loading) or non-loading.
    const isLight = variant === 'outline' || variant === 'ghost' || variant === 'link';
    const sweepClass = isLight
      ? 'bg-gradient-to-r from-transparent via-accent/15 to-transparent'
      : 'bg-gradient-to-r from-transparent via-white/35 to-transparent';

    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && (
          <>
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 motion-safe:animate-shimmer',
                sweepClass,
              )}
              style={{ backgroundSize: '200% 100%' }}
            />
            <Spinner />
          </>
        )}
        <span className={cn('relative inline-flex items-center gap-2', loading && 'opacity-95')}>
          {loading && loadingLabel ? loadingLabel : children}
        </span>
      </button>
    );
  },
);
Button.displayName = 'Button';

function Spinner() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="relative h-4 w-4 motion-safe:animate-spin"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { buttonVariants };
