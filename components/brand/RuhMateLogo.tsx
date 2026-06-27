import { cn } from '@/lib/utils';

type Variant = 'pink' | 'white' | 'dashboard' | 'footer';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS: Record<Size, string> = {
  xs: 'h-5',
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-11',
  xl: 'h-14',
};

interface RuhMateLogoProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  priority?: boolean;
}

// Source files live in /public — filenames contain a space, encoded for safety.
const SRC: Record<Variant, string> = {
  pink: '/new%20logo.png',
  white: '/white%20logo.png',
  dashboard: '/Dashboard%20Logo.png',
  footer: '/footer%20logo.png',
};

export function RuhMateLogo({
  variant = 'pink',
  size = 'md',
  className,
  priority,
}: RuhMateLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant]}
      alt="RuhMate"
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn(
        SIZE_CLASS[size],
        'w-auto select-none object-contain',
        className,
      )}
    />
  );
}
