import Image from 'next/image';
import { cn } from '@/lib/utils';

// Clean filename (copied from "Love bot 2.png") so the URL has no spaces to
// encode. Source render is 1536 × 2752 (a tall portrait).
const BOT_SRC = '/love-bot.png';
const BOT_RATIO = 2752 / 1536;

interface LoveBotProps {
  /** Rendered width in px (height scales with the source aspect ratio). */
  width?: number;
  /** Slightly different drift speed so multiple bots don't move in lockstep. */
  speed?: 'normal' | 'slow';
  className?: string;
  priority?: boolean;
  /** Soft pink glow behind the bot. On by default for the hero. */
  glow?: boolean;
}

/**
 * The RuhMate love-bot mascot. Floats gently (slow vertical drift + a touch of
 * rotation). Motion is disabled automatically under prefers-reduced-motion via
 * the global rule in globals.css.
 */
export function LoveBot({
  width = 320,
  speed = 'normal',
  className,
  priority = false,
  glow = true,
}: LoveBotProps) {
  const height = Math.round(width * BOT_RATIO);
  return (
    <div className={cn('pointer-events-none relative select-none', className)}>
      {glow && (
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(224,71,157,0.35), rgba(224,71,157,0.08) 55%, transparent 72%)',
            filter: 'blur(26px)',
          }}
        />
      )}
      <div className={speed === 'slow' ? 'anim-bot-float-slow' : 'anim-bot-float'}>
        <Image
          src={BOT_SRC}
          alt="RuhMate AI matching assistant"
          width={width}
          height={height}
          priority={priority}
          className="h-auto w-full object-contain drop-shadow-[0_18px_40px_rgba(130,20,90,0.28)]"
        />
      </div>
    </div>
  );
}
