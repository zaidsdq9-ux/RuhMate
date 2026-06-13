import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          alt: '#fbf7f9',
          blush: '#ffe9f4',
          rose: '#fff5fa',
          cream: '#fbf6ef',
          deep: '#1a0f18',
        },
        ink: {
          DEFAULT: '#1a1018',
          soft: '#564553',
          muted: '#8a7a85',
          faint: '#b3a4ad',
          inverse: '#fbf7f9',
        },
        line: {
          DEFAULT: '#efe7ec',
          soft: '#f7eff3',
          strong: '#d9ccd4',
        },
        // Brand rose — richer/darker pink per client (May 2026). Primary #C3348B.
        rose: {
          DEFAULT: '#c3348b',
          hover: '#a92778',
          deep: '#8e1d63',
          soft: '#fcdcec',
          bg: '#fff1f8',
        },
        // Legacy accent alias — kept so existing pages don't break.
        accent: {
          DEFAULT: '#c3348b',
          hover: '#a92778',
          soft: '#fcdcec',
          deep: '#8e1d63',
        },
        gold: {
          DEFAULT: '#c8a25a',
          soft: '#f5ead2',
          deep: '#8a6a30',
        },
        success: '#0d7a6b',
        warning: '#c47a1a',
        danger: '#b8345a',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        // Headings now share the same clean sans (Montserrat) — minimal & modern,
        // weight handled per-class. Kept as a separate token so callers don't break.
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '8px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        card: '20px',
        btn: '10px',
        pill: '999px',
        xl2: '28px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 8, 16, 0.04), 0 2px 6px rgba(20, 8, 16, 0.04)',
        card: '0 1px 2px rgba(20, 8, 16, 0.04), 0 8px 24px -10px rgba(122, 29, 104, 0.12)',
        lift: '0 12px 32px -12px rgba(122, 29, 104, 0.2), 0 4px 12px rgba(20, 8, 16, 0.04)',
        glow: '0 0 0 1px rgba(224, 71, 157, 0.14), 0 22px 48px -22px rgba(224, 71, 157, 0.55)',
        pop: '0 22px 60px -20px rgba(122, 29, 104, 0.35)',
        ring: '0 0 0 3px rgba(224, 71, 157, 0.3)',
      },
      backgroundImage: {
        'mesh-blush':
          'radial-gradient(60% 60% at 15% 5%, rgba(255,219,237,0.9) 0%, rgba(255,219,237,0) 60%), radial-gradient(40% 50% at 85% 15%, rgba(245,234,210,0.7) 0%, rgba(245,234,210,0) 60%), radial-gradient(50% 60% at 70% 95%, rgba(224,71,157,0.18) 0%, rgba(224,71,157,0) 60%)',
        'mesh-aurora':
          'radial-gradient(40% 40% at 10% 30%, rgba(224,71,157,0.45), transparent 60%), radial-gradient(50% 40% at 85% 20%, rgba(200,162,90,0.35), transparent 60%), radial-gradient(60% 60% at 60% 95%, rgba(122,29,104,0.42), transparent 60%)',
        'gradient-rose':
          'linear-gradient(135deg, #c3348b 0%, #8e1d63 100%)',
        'gradient-accent':
          'linear-gradient(135deg, #c3348b 0%, #8e1d63 100%)',
        'gradient-gold':
          'linear-gradient(135deg, #c8a25a 0%, #8a6a30 100%)',
        'gradient-text':
          'linear-gradient(135deg, #8e1d63 0%, #c3348b 50%, #c8a25a 100%)',
        'sidebar':
          'linear-gradient(180deg, #ffffff 0%, #fbf6ef 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-14px) translateX(6px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(20px,-30px,0) scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'tick-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '60%': { transform: 'translateY(-2px)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'float-y': 'float-y 7s ease-in-out infinite',
        'float-slow': 'float-slow 14s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'gradient-pan': 'gradient-pan 12s ease infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
        'tick-in': 'tick-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
