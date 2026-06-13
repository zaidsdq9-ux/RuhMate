import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icons';

interface ProfileAvatarProps {
  /** Pixel size of the circular avatar. */
  size?: number;
  className?: string;
}

/**
 * Clean circular profile/identity avatar. RuhMate is photo-free by design
 * (CLAUDE.md), so this always renders the default user icon on the brand pink
 * gradient. If photo support is ever added, branch on a `src` prop here.
 */
export function ProfileAvatar({ size = 84, className }: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full text-white shadow-soft ring-1 ring-white/40',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(150deg, var(--rose) 0%, var(--rose-deep) 100%)',
      }}
      aria-hidden
    >
      <Icon.User size={Math.round(size * 0.5)} />
    </div>
  );
}
