/* Shared design-system icon set — matches Claude Design icon vocabulary. */

const stk = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

type P = { className?: string; size?: number };

export const Icon = {
  Search: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="11" cy="11" r="7" {...stk} />
      <path d="M20 20l-3.5-3.5" {...stk} />
    </svg>
  ),
  Heart: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 11c0 5.65-9 10-9 10z"
        {...stk}
      />
    </svg>
  ),
  HeartFill: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 11c0 5.65-9 10-9 10z"
      />
    </svg>
  ),
  User: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="8" r="4" {...stk} />
      <path d="M4 21a8 8 0 0 1 16 0" {...stk} />
    </svg>
  ),
  Wallet: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M3 7h15a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7zm0 0V6a2 2 0 0 1 2-2h11"
        {...stk}
      />
      <circle cx="17" cy="13.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  Settings: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="3" {...stk} />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.8 2 2 0 1 1-2.8 2.8 1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5 2 2 0 1 1-4 0 1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3 2 2 0 1 1-2.8-2.8 1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1 2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8 2 2 0 1 1 2.8-2.8 1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5 2 2 0 1 1 4 0 1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3 2 2 0 1 1 2.8 2.8 1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1 2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.5 1z"
        {...stk}
      />
    </svg>
  ),
  Lock: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" {...stk} />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" {...stk} />
    </svg>
  ),
  Spark: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    </svg>
  ),
  Arrow: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} strokeWidth={2} d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  Check: ({ size = 12, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} strokeWidth={3} d="M5 12l5 5L20 7" />
    </svg>
  ),
  Shield: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z" />
      <path {...stk} d="M9 12l2 2 4-4" />
    </svg>
  ),
  Sparkles: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
      <path fill="currentColor" opacity=".6" d="M19 14l.9 2.6L22.5 17l-2.6.9L19 20l-.9-2.1L15.5 17l2.6-.4L19 14z" />
    </svg>
  ),
  Grid: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" {...stk} />
      <rect x="14" y="3" width="7" height="7" rx="1.5" {...stk} />
      <rect x="3" y="14" width="7" height="7" rx="1.5" {...stk} />
      <rect x="14" y="14" width="7" height="7" rx="1.5" {...stk} />
    </svg>
  ),
  Family: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="8" cy="8" r="3" {...stk} />
      <circle cx="16" cy="9" r="2.5" {...stk} />
      <path {...stk} d="M2 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 8-4" />
    </svg>
  ),
  Mosque: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M12 2c0 2 1 3 1 5s-1 3-1 3-1-1-1-3 1-3 1-5z" />
      <path {...stk} d="M4 21V12a8 8 0 0 1 16 0v9M4 21h16M9 21v-5a3 3 0 0 1 6 0v5" />
    </svg>
  ),
  Pin: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
      <circle cx="12" cy="10" r="2.5" {...stk} />
    </svg>
  ),
  Cake: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M4 21h16v-7H4zM6 14v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M12 9V5" />
      <circle cx="12" cy="4" r="1" {...stk} />
    </svg>
  ),
  Briefcase: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2" {...stk} />
      <path {...stk} d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  GraduationCap: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M22 10L12 4 2 10l10 6 10-6zM6 12v5c3 2 9 2 12 0v-5" />
    </svg>
  ),
  Menu: ({ size = 22, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  Close: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} strokeWidth={2} d="M6 6l12 12M18 6l-12 12" />
    </svg>
  ),
  Bell: ({ size = 20, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3z" />
      <path {...stk} d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  ),
  Filter: ({ size = 16, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M4 5h16l-6 8v6l-4-2v-4z" />
    </svg>
  ),
  Star: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 2l3 6.5L22 10l-5 5 1.5 7L12 18l-6.5 4L7 15l-5-5 7-1.5z" />
    </svg>
  ),
  Plus: ({ size = 16, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} strokeWidth={2} d="M12 5v14M5 12h14" />
    </svg>
  ),
  Quote: ({ size = 32, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <path
        fill="currentColor"
        opacity=".8"
        d="M10 8c-3 0-6 3-6 7v9h9V14H8c0-2 1-4 3-4V8zm14 0c-3 0-6 3-6 7v9h9V14h-5c0-2 1-4 3-4V8z"
      />
    </svg>
  ),
  Share: ({ size = 16, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="18" cy="5" r="3" {...stk} />
      <circle cx="6" cy="12" r="3" {...stk} />
      <circle cx="18" cy="19" r="3" {...stk} />
      <path {...stk} d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
    </svg>
  ),
  Phone: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        {...stk}
        d="M5 4h4l2 5-3 2c1 3 3 5 6 6l2-3 5 2v4a2 2 0 0 1-2 2C9 22 2 15 2 6a2 2 0 0 1 2-2z"
      />
    </svg>
  ),
  Chat: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M21 12a8 8 0 0 1-12.5 6.5L3 20l1.5-5.5A8 8 0 1 1 21 12z" />
    </svg>
  ),
  Logout: ({ size = 16, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Crown: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M2 18l2-10 5 5 3-7 3 7 5-5 2 10z" />
    </svg>
  ),
  Eye: ({ size = 16, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path {...stk} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" {...stk} />
    </svg>
  ),
  EyeOff: ({ size = 16, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        {...stk}
        d="M3 3l18 18M10.5 6.2A10 10 0 0 1 12 6c7 0 11 6 11 6a18 18 0 0 1-3.6 4.2M6.6 6.6C3.3 8.3 1 12 1 12s4 7 11 7c1.7 0 3.2-.4 4.5-1"
      />
      <path {...stk} d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ),
  Verified: ({ size = 14, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12 1l3 2 3.5-.5L20 5l3 1-1 3 1 3-3 1-1.5 2.5L15 14l-3 2-3-2-3.5.5L4 12l-3-1 1-3-1-3 3-1L5.5 2.5 9 3z"
      />
      <path stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" d="M8 12l3 3 5-6" />
    </svg>
  ),
  /* Gender-based profile silhouettes (photo-free identity avatars). */
  Male: ({ size = 24, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="7.5" r="3.6" {...stk} />
      <path {...stk} d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
    </svg>
  ),
  Female: ({ size = 24, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      {/* head with a soft veil/hijab silhouette to read as female + modest */}
      <path {...stk} d="M12 3.4c-3 0-4.6 2.2-4.6 4.8 0 1.4.5 2.5 1.3 3.3" />
      <path {...stk} d="M12 3.4c3 0 4.6 2.2 4.6 4.8 0 1.4-.5 2.5-1.3 3.3" />
      <path {...stk} d="M8.7 11.5c.9.7 2 1.1 3.3 1.1s2.4-.4 3.3-1.1" />
      <path {...stk} d="M5.4 20.4c.4-3.8 3.2-6 6.6-6s6.2 2.2 6.6 6" />
    </svg>
  ),
  Facebook: ({ size = 18, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"
      />
    </svg>
  ),
  Instagram: ({ size = 18, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" {...stk} />
      <circle cx="12" cy="12" r="4" {...stk} />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  ),
  TikTok: ({ size = 18, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.5c-1.3 0-2.5-.4-3.5-1.1v5.9a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.6a2.9 2.9 0 1 0 2 2.8V3h2.6z"
      />
    </svg>
  ),
  Mail: ({ size = 18, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" {...stk} />
      <path {...stk} d="M4 7l8 5.5L20 7" />
    </svg>
  ),
  Whatsapp: ({ size = 18, className }: P = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.3.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.7 3.1.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3z"
      />
    </svg>
  ),
};
