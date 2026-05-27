import type { Timestamp } from 'firebase-admin/firestore';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'disabled';
export type Gender = 'male' | 'female';
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed';
export type ProfileStatus = 'draft' | 'published' | 'hidden';
export type LocationPreference = 'local' | 'abroad' | 'either';
export type PayhereStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type AuditAction =
  | 'create_user'
  | 'disable_user'
  | 'enable_user'
  | 'edit_settings'
  | 'edit_pack'
  | 'create_pack'
  | 'delete_pack'
  | 'manual_credit_adjust'
  | 'unlock_contact'
  | 'publish_profile'
  | 'reset_profile_for_sibling'
  | 'webhook_credit'
  | 'webhook_signature_reject';

export interface UserDoc {
  uid: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  phone: string;
  role: UserRole;
  status: UserStatus;
  points_balance: number;
  has_profile: boolean;
  preference_text?: string;
  preference_embedding?: number[];
  preference_embedding_hash?: string;
  auth_providers: ('password' | 'google.com')[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProfileDoc {
  id: string;
  user_id: string;
  index_number: number;
  display_name: string;
  gender: Gender;
  date_of_birth: Timestamp;
  marital_status: MaritalStatus;
  height_cm: number;
  current_city: string;
  district: string;
  nationality: string;
  religion: string;
  ethnicity?: string;
  mother_tongue: string;
  education_level: string;
  occupation: string;
  employment_type: string;
  company_industry?: string;
  monthly_income?: number;
  about_me: string;
  father_occupation: string;
  mother_occupation: string;
  brothers_count: number;
  sisters_count: number;
  family_details: string;
  willing_to_relocate: boolean;
  location_preference: LocationPreference;
  contact_phone: string;
  contact_whatsapp: string;
  status: ProfileStatus;
  embedding?: number[];
  embedding_input_hash?: string;
  last_embedded_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UnlockDoc {
  id: string;
  viewer_user_id: string;
  target_profile_id: string;
  target_index_number: number;
  points_spent: number;
  unlocked_at: Timestamp;
}

export interface TransactionDoc {
  id: string;
  user_id: string;
  pack_id: string;
  points_purchased: number;
  amount_lkr: number;
  payhere_payment_id?: string;
  payhere_status: PayhereStatus;
  raw_payload?: Record<string, unknown>;
  created_at: Timestamp;
  completed_at?: Timestamp;
}

export interface PointPackDoc {
  id: string;
  name: string;
  points: number;
  price_lkr: number;
  active: boolean;
  display_order: number;
}

export interface SettingsDoc {
  contact_unlock_cost: number;
  view_details_cost: number;
  maintenance_mode: boolean;
  maintenance_message?: string;
  signup_open: boolean;
}

export interface AuditLogDoc {
  id: string;
  actor_uid: string;
  action: AuditAction;
  target_id?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  created_at: Timestamp;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
