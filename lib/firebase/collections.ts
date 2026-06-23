export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  UNLOCKS: 'unlocks',
  TRANSACTIONS: 'transactions',
  // manual bank-transfer purchase requests, approved by an admin to grant points
  PAYMENT_REQUESTS: 'payment_requests',
  POINT_PACKS: 'point_packs',
  SETTINGS: 'settings',
  COUNTERS: 'counters',
  AUDIT_LOG: 'audit_log',
  REPORTS: 'reports',
  RATE_LIMITS: 'rate_limits',
  // viewer-curated state — one doc per (viewer, target) pair, idempotent
  PROFILE_ACTIONS: 'profile_actions',
} as const;

export const SETTINGS_DOC_ID = 'global';
export const PROFILE_INDEX_COUNTER_DOC_ID = 'profile_index';
export const PROFILE_INDEX_START = 1000;
