import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icons';

interface PortraitProps {
  /** Profile index — retained for a stable key/aria label, no longer shown as text. */
  idx: string | number;
  size?: number;
  /**
   * Drives which silhouette is drawn. RuhMate is photo-free by design, so the
   * avatar is a clean gender-based illustration rather than a number badge.
   * Male → indigo background. Female → rose background. Falls back to neutral.
   */
  gender?: 'male' | 'female';
  className?: string;
}

export function Portrait({ idx, size = 56, gender, className }: PortraitProps) {
  const iconSize = Math.round(size * 0.52);
  const Glyph =
    gender === 'male' ? Icon.Male : gender === 'female' ? Icon.Female : Icon.User;
  const genderVariant =
    gender === 'male' ? 'portrait-male' : gender === 'female' ? 'portrait-female' : '';
  return (
    <div
      className={cn('portrait', genderVariant, className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Profile'} avatar`}
    >
      <span className="relative z-[2] grid place-items-center text-white">
        <Glyph size={iconSize} />
      </span>
    </div>
  );
}
