import Image from 'next/image';
import { ProgressLoader } from '@/components/loading/ProgressLoader';
import { RotatingReminder } from '@/components/loading/RotatingReminder';

interface Props {
  /** Optional headline shown above the progress bar. Defaults to "RuhMate". */
  headline?: string;
  /** Subtitle line. */
  subtitle?: string;
  /** When false, hides the rotating reminder (e.g., for very fast transitions). */
  showReminder?: boolean;
  /** Fills the viewport when true; otherwise inline. Default true. */
  fullscreen?: boolean;
}

export function LoadingScreen({
  headline = 'RuhMate',
  subtitle = 'Preparing your matches',
  showReminder = true,
  fullscreen = true,
}: Props) {
  const wrapperBase =
    'flex flex-col items-center justify-center gap-8 px-6 py-12 ' +
    'bg-[radial-gradient(60%_60%_at_50%_30%,#ffe9f6_0%,#fff7ef_55%,#ffffff_100%)]';
  const wrapperSize = fullscreen ? 'min-h-screen' : 'min-h-[420px] rounded-card border border-line';

  return (
    <div className={wrapperBase + ' ' + wrapperSize}>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative motion-safe:animate-float-slow">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-full bg-accent/15 blur-2xl motion-safe:animate-pulse-soft"
          />
          <Image
            src="/pink%20logo.png"
            alt="RuhMate"
            width={88}
            height={88}
            priority
            className="h-16 w-auto md:h-20"
          />
        </div>
        <div>
          <h1 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
            {headline}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
      </div>

      <div className="w-full max-w-xs sm:max-w-sm">
        <ProgressLoader />
      </div>

      {showReminder && (
        <div className="w-full">
          <RotatingReminder />
        </div>
      )}
    </div>
  );
}
