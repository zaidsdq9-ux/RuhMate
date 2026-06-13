/**
 * Seed 30 demo profiles into Firestore so you can see the feed working.
 *
 *   npx tsx scripts/seed-demo-profiles.ts            # write + embed (uses OpenAI key if present)
 *   npx tsx scripts/seed-demo-profiles.ts --no-embed # skip OpenAI calls
 *
 * Each profile is flagged with `is_demo: true` so they're easy to wipe later
 * (see scripts/delete-demo-profiles.ts). UIDs are deterministic
 * (`demo_user_NN`) so re-runs upsert in place — no duplicates.
 *
 * These do NOT have real Firebase Auth users — they're feed fixtures only.
 * You will NOT be able to log in as them. They appear in /feed for browsing
 * and unlocking, which is what we want for a demo walkthrough.
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const noEmbed = process.argv.includes('--no-embed');

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase Admin env vars in .env.local.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

// ─────────────────────────────────────────────────────────────────────────────
// Seed data — 30 demo profiles, varied countries / genders / ages / religions
// ─────────────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female';
type Marital = 'never_married' | 'divorced' | 'widowed';
type RegisteredBy = 'self' | 'son' | 'daughter' | 'brother' | 'sister' | 'relative' | 'friend';
type LocationPref = 'local' | 'abroad' | 'either';

interface DemoProfile {
  display_name: string;
  gender: Gender;
  dob: string; // YYYY-MM-DD
  marital_status: Marital;
  height_cm: number;
  country: string;
  current_city: string;
  district?: string;
  nationality: string;
  ethnicity?: string;
  mother_tongue: string;
  religion: string;
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
  location_preference: LocationPref;
  preference_text: string;
  contact_phone: string;
  contact_whatsapp: string;
  registered_by: RegisteredBy;
}

const PROFILES: DemoProfile[] = [
  // ── Sri Lanka (10) ─────────────────────────────────────────────────────────
  {
    display_name: 'Aisha F.', gender: 'female', dob: '1996-04-12', marital_status: 'never_married',
    height_cm: 162, country: 'Sri Lanka', current_city: 'Colombo', district: 'Colombo',
    nationality: 'Sri Lankan', ethnicity: 'Sri Lankan Moor', mother_tongue: 'Tamil', religion: 'Islam',
    education_level: 'BSc', occupation: 'Software Engineer', employment_type: 'Full-time',
    company_industry: 'Technology', monthly_income: 250000,
    about_me: 'Practising Muslim, family-oriented, enjoy reading and weekend hikes around the hills near Kandy.',
    father_occupation: 'Retired teacher', mother_occupation: 'Homemaker', brothers_count: 1, sisters_count: 2,
    family_details: 'Close-knit traditional family living in Colombo for three generations.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a practising Muslim partner who values family, prayer, and personal growth. Education and kindness matter most.',
    contact_phone: '+94 77 1234001', contact_whatsapp: '+94 77 1234001', registered_by: 'self',
  },
  {
    display_name: 'Mohamed R.', gender: 'male', dob: '1992-09-22', marital_status: 'never_married',
    height_cm: 178, country: 'Sri Lanka', current_city: 'Kandy', district: 'Kandy',
    nationality: 'Sri Lankan', ethnicity: 'Sri Lankan Moor', mother_tongue: 'Tamil', religion: 'Islam',
    education_level: 'MBA', occupation: 'Operations Manager', employment_type: 'Full-time',
    company_industry: 'Logistics', monthly_income: 350000,
    about_me: 'Manage a regional logistics team. Believe in honest work, family time, and giving back to community.',
    father_occupation: 'Businessman', mother_occupation: 'Retired nurse', brothers_count: 2, sisters_count: 1,
    family_details: 'Business family running a small import operation since 1985.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Seeking an educated, religious partner who can build a calm and respectful home together.',
    contact_phone: '+94 77 1234002', contact_whatsapp: '+94 77 1234002', registered_by: 'self',
  },
  {
    display_name: 'Fathima N.', gender: 'female', dob: '1998-02-05', marital_status: 'never_married',
    height_cm: 158, country: 'Sri Lanka', current_city: 'Galle', district: 'Galle',
    nationality: 'Sri Lankan', mother_tongue: 'Sinhala', religion: 'Islam',
    education_level: 'BBA', occupation: 'Marketing Executive', employment_type: 'Full-time',
    company_industry: 'Hospitality', monthly_income: 150000,
    about_me: 'Marketing professional with a love for travel writing and the southern coast.',
    father_occupation: 'Engineer', mother_occupation: 'Teacher', brothers_count: 0, sisters_count: 1,
    family_details: 'Small family, both parents working professionals in Galle.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Hoping to meet someone ambitious, kind, with strong values and an interest in seeing the world together.',
    contact_phone: '+94 77 1234003', contact_whatsapp: '+94 77 1234003', registered_by: 'self',
  },
  {
    display_name: 'Imran S.', gender: 'male', dob: '1989-07-30', marital_status: 'divorced',
    height_cm: 175, country: 'Sri Lanka', current_city: 'Negombo', district: 'Gampaha',
    nationality: 'Sri Lankan', mother_tongue: 'English', religion: 'Christianity',
    education_level: 'Diploma', occupation: 'Restaurant Owner', employment_type: 'Self-employed',
    company_industry: 'Food & beverage', monthly_income: 400000,
    about_me: 'Own a seafood restaurant in Negombo. Recently divorced, looking to start a new chapter.',
    father_occupation: 'Retired fisherman', mother_occupation: 'Homemaker', brothers_count: 3, sisters_count: 2,
    family_details: 'Large coastal family, very welcoming and warm.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for someone mature and understanding. Children are welcome.',
    contact_phone: '+94 77 1234004', contact_whatsapp: '+94 77 1234004', registered_by: 'self',
  },
  {
    display_name: 'Shahana K.', gender: 'female', dob: '1995-11-18', marital_status: 'never_married',
    height_cm: 165, country: 'Sri Lanka', current_city: 'Jaffna', district: 'Jaffna',
    nationality: 'Sri Lankan', ethnicity: 'Sri Lankan Tamil', mother_tongue: 'Tamil', religion: 'Hinduism',
    education_level: 'MSc', occupation: 'Research Scientist', employment_type: 'Full-time',
    company_industry: 'Education', monthly_income: 280000,
    about_me: 'Marine biology researcher. Love the ocean, classical music, and good books.',
    father_occupation: 'University professor', mother_occupation: 'Doctor', brothers_count: 0, sisters_count: 1,
    family_details: 'Academic family with deep roots in northern Sri Lanka.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for an intellectual, gentle partner who respects my career and shares my curiosity.',
    contact_phone: '+94 77 1234005', contact_whatsapp: '+94 77 1234005', registered_by: 'sister',
  },
  {
    display_name: 'Roshan P.', gender: 'male', dob: '1993-03-08', marital_status: 'never_married',
    height_cm: 172, country: 'Sri Lanka', current_city: 'Colombo', district: 'Colombo',
    nationality: 'Sri Lankan', mother_tongue: 'Sinhala', religion: 'Buddhism',
    education_level: 'BSc', occupation: 'Civil Engineer', employment_type: 'Full-time',
    company_industry: 'Construction', monthly_income: 320000,
    about_me: 'Civil engineer working on infrastructure projects. Avid cricketer on weekends.',
    father_occupation: 'Banker', mother_occupation: 'Homemaker', brothers_count: 1, sisters_count: 1,
    family_details: 'Middle-class urban family with traditional values.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for a kind, family-oriented partner who enjoys quiet weekends and good conversation.',
    contact_phone: '+94 77 1234006', contact_whatsapp: '+94 77 1234006', registered_by: 'self',
  },
  {
    display_name: 'Nadia H.', gender: 'female', dob: '1997-06-25', marital_status: 'never_married',
    height_cm: 160, country: 'Sri Lanka', current_city: 'Kurunegala', district: 'Kurunegala',
    nationality: 'Sri Lankan', mother_tongue: 'Tamil', religion: 'Islam',
    education_level: 'BSc', occupation: 'Pharmacist', employment_type: 'Full-time',
    company_industry: 'Healthcare', monthly_income: 180000,
    about_me: 'Pharmacist who loves cooking, gardening, and Friday family dinners.',
    father_occupation: 'Doctor', mother_occupation: 'Pharmacist', brothers_count: 1, sisters_count: 0,
    family_details: 'Medical family with strong religious values.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Seeking a practising Muslim husband with a stable career, good character, and respect for family.',
    contact_phone: '+94 77 1234007', contact_whatsapp: '+94 77 1234007', registered_by: 'self',
  },
  {
    display_name: 'Asif M.', gender: 'male', dob: '1985-12-14', marital_status: 'widowed',
    height_cm: 180, country: 'Sri Lanka', current_city: 'Batticaloa', district: 'Batticaloa',
    nationality: 'Sri Lankan', mother_tongue: 'Tamil', religion: 'Islam',
    education_level: 'MBA', occupation: 'Bank Manager', employment_type: 'Full-time',
    company_industry: 'Banking', monthly_income: 450000,
    about_me: 'Banker, widowed three years ago with one child. Looking to rebuild a loving home.',
    father_occupation: 'Retired teacher', mother_occupation: 'Homemaker', brothers_count: 2, sisters_count: 1,
    family_details: 'Supportive extended family, religious and respectful.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Hoping to meet a patient, kind partner who can embrace family life and step-parent with love.',
    contact_phone: '+94 77 1234008', contact_whatsapp: '+94 77 1234008', registered_by: 'self',
  },
  {
    display_name: 'Lakshmi V.', gender: 'female', dob: '1994-01-09', marital_status: 'never_married',
    height_cm: 163, country: 'Sri Lanka', current_city: 'Trincomalee', district: 'Trincomalee',
    nationality: 'Sri Lankan', ethnicity: 'Sri Lankan Tamil', mother_tongue: 'Tamil', religion: 'Hinduism',
    education_level: 'BA', occupation: 'School Teacher', employment_type: 'Full-time',
    company_industry: 'Education', monthly_income: 120000,
    about_me: 'High school English teacher. Passionate about education and youth development.',
    father_occupation: 'Farmer', mother_occupation: 'Tailor', brothers_count: 2, sisters_count: 0,
    family_details: 'Hardworking traditional family from the eastern coast.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for an educated, respectful partner who values family above career.',
    contact_phone: '+94 77 1234009', contact_whatsapp: '+94 77 1234009', registered_by: 'brother',
  },
  {
    display_name: 'Hassan A.', gender: 'male', dob: '1990-08-20', marital_status: 'never_married',
    height_cm: 176, country: 'Sri Lanka', current_city: 'Matara', district: 'Matara',
    nationality: 'Sri Lankan', mother_tongue: 'Sinhala', religion: 'Islam',
    education_level: 'PhD', occupation: 'University Lecturer', employment_type: 'Full-time',
    company_industry: 'Education', monthly_income: 300000,
    about_me: 'Computer science lecturer with a passion for teaching and Quranic studies.',
    father_occupation: 'Imam', mother_occupation: 'Homemaker', brothers_count: 1, sisters_count: 2,
    family_details: 'Deeply religious family, four generations in the south.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Hoping for a religious, educated partner who is committed to building a strong Islamic home.',
    contact_phone: '+94 77 1234010', contact_whatsapp: '+94 77 1234010', registered_by: 'self',
  },

  // ── India (6) ──────────────────────────────────────────────────────────────
  {
    display_name: 'Priya M.', gender: 'female', dob: '1995-05-15', marital_status: 'never_married',
    height_cm: 161, country: 'India', current_city: 'Bangalore',
    nationality: 'Indian', ethnicity: 'South Indian', mother_tongue: 'Tamil', religion: 'Hinduism',
    education_level: 'MSc', occupation: 'Data Scientist', employment_type: 'Full-time',
    company_industry: 'Technology', monthly_income: 450000,
    about_me: 'Data scientist at a global tech firm. Love trekking in the Western Ghats.',
    father_occupation: 'Chartered Accountant', mother_occupation: 'School Principal', brothers_count: 0, sisters_count: 1,
    family_details: 'Educated Tamil Brahmin family settled in Bangalore.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Seeking a thoughtful, ambitious partner with similar educational background and openness to travel.',
    contact_phone: '+91 98 1112001', contact_whatsapp: '+91 98 1112001', registered_by: 'self',
  },
  {
    display_name: 'Arjun R.', gender: 'male', dob: '1991-10-03', marital_status: 'never_married',
    height_cm: 181, country: 'India', current_city: 'Mumbai',
    nationality: 'Indian', mother_tongue: 'Hindi', religion: 'Hinduism',
    education_level: 'MBA', occupation: 'Investment Banker', employment_type: 'Full-time',
    company_industry: 'Finance', monthly_income: 1200000,
    about_me: 'Investment banker by day, amateur photographer on weekends.',
    father_occupation: 'Doctor', mother_occupation: 'Doctor', brothers_count: 0, sisters_count: 1,
    family_details: 'Mumbai-based medical family with progressive outlook.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for an independent, well-educated partner who values both career and family life.',
    contact_phone: '+91 98 1112002', contact_whatsapp: '+91 98 1112002', registered_by: 'self',
  },
  {
    display_name: 'Zainab K.', gender: 'female', dob: '1996-12-22', marital_status: 'never_married',
    height_cm: 159, country: 'India', current_city: 'Hyderabad',
    nationality: 'Indian', mother_tongue: 'Urdu', religion: 'Islam',
    education_level: 'MBBS', occupation: 'Doctor', employment_type: 'Full-time',
    company_industry: 'Healthcare', monthly_income: 350000,
    about_me: 'Resident doctor specializing in pediatrics. Family is everything to me.',
    father_occupation: 'Businessman', mother_occupation: 'Homemaker', brothers_count: 1, sisters_count: 1,
    family_details: 'Conservative Muslim family with strong educational values.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Seeking a practising Muslim husband, ideally also in healthcare, with deen and good character.',
    contact_phone: '+91 98 1112003', contact_whatsapp: '+91 98 1112003', registered_by: 'relative',
  },
  {
    display_name: 'Vikram S.', gender: 'male', dob: '1988-04-18', marital_status: 'divorced',
    height_cm: 174, country: 'India', current_city: 'Delhi',
    nationality: 'Indian', mother_tongue: 'Hindi', religion: 'Sikhism',
    education_level: 'MTech', occupation: 'Tech Lead', employment_type: 'Full-time',
    company_industry: 'Technology', monthly_income: 800000,
    about_me: 'Tech lead at a multinational. Divorced, no children. Looking for a fresh start.',
    father_occupation: 'Army officer (retired)', mother_occupation: 'Teacher', brothers_count: 1, sisters_count: 0,
    family_details: 'Disciplined Sikh family with strong values.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Hoping to find a mature, understanding partner who values commitment and personal growth.',
    contact_phone: '+91 98 1112004', contact_whatsapp: '+91 98 1112004', registered_by: 'self',
  },
  {
    display_name: 'Meera P.', gender: 'female', dob: '1993-07-11', marital_status: 'never_married',
    height_cm: 167, country: 'India', current_city: 'Chennai',
    nationality: 'Indian', ethnicity: 'South Indian', mother_tongue: 'Tamil', religion: 'Christianity',
    education_level: 'MA', occupation: 'Architect', employment_type: 'Self-employed',
    company_industry: 'Architecture', monthly_income: 380000,
    about_me: 'Independent architect, love sketching and reggae music.',
    father_occupation: 'Banker', mother_occupation: 'Homemaker', brothers_count: 1, sisters_count: 0,
    family_details: 'Liberal Christian family in Chennai.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a creative, thoughtful partner who respects independence and shares a love for art.',
    contact_phone: '+91 98 1112005', contact_whatsapp: '+91 98 1112005', registered_by: 'self',
  },
  {
    display_name: 'Rohan G.', gender: 'male', dob: '1994-02-28', marital_status: 'never_married',
    height_cm: 183, country: 'India', current_city: 'Pune',
    nationality: 'Indian', mother_tongue: 'Marathi', religion: 'Hinduism',
    education_level: 'BTech', occupation: 'Product Manager', employment_type: 'Full-time',
    company_industry: 'Technology', monthly_income: 600000,
    about_me: 'Product manager at an edtech startup. Marathi-speaking household, modern outlook.',
    father_occupation: 'Government officer', mother_occupation: 'Professor', brothers_count: 0, sisters_count: 1,
    family_details: 'Educated middle-class Maharashtrian family.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a partner with strong values, intellect, and a good sense of humour.',
    contact_phone: '+91 98 1112006', contact_whatsapp: '+91 98 1112006', registered_by: 'self',
  },

  // ── UAE (3) ────────────────────────────────────────────────────────────────
  {
    display_name: 'Sana T.', gender: 'female', dob: '1992-11-04', marital_status: 'never_married',
    height_cm: 164, country: 'UAE', current_city: 'Dubai',
    nationality: 'Pakistani', mother_tongue: 'Urdu', religion: 'Islam',
    education_level: 'MBA', occupation: 'HR Manager', employment_type: 'Full-time',
    company_industry: 'Consulting', monthly_income: 700000,
    about_me: 'Pakistani expat in Dubai, working in HR for 8 years. Love the Dubai marina life.',
    father_occupation: 'Businessman', mother_occupation: 'Homemaker', brothers_count: 1, sisters_count: 2,
    family_details: 'Modern, religious family originally from Karachi.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a deen-conscious, well-settled Muslim partner in the Gulf or willing to relocate.',
    contact_phone: '+971 50 5556001', contact_whatsapp: '+971 50 5556001', registered_by: 'self',
  },
  {
    display_name: 'Khalid A.', gender: 'male', dob: '1987-06-19', marital_status: 'never_married',
    height_cm: 179, country: 'UAE', current_city: 'Abu Dhabi',
    nationality: 'Sri Lankan', mother_tongue: 'Tamil', religion: 'Islam',
    education_level: 'BEng', occupation: 'Petroleum Engineer', employment_type: 'Full-time',
    company_industry: 'Oil & gas', monthly_income: 950000,
    about_me: 'Sri Lankan expat working in oil and gas in Abu Dhabi for over a decade.',
    father_occupation: 'Retired bank manager', mother_occupation: 'Homemaker', brothers_count: 2, sisters_count: 1,
    family_details: 'Tightly-knit Sri Lankan family with siblings in Australia and Canada.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for a practising Muslim wife who can settle in the UAE and build a family here.',
    contact_phone: '+971 50 5556002', contact_whatsapp: '+971 50 5556002', registered_by: 'self',
  },
  {
    display_name: 'Reem H.', gender: 'female', dob: '1999-03-27', marital_status: 'never_married',
    height_cm: 168, country: 'UAE', current_city: 'Sharjah',
    nationality: 'Emirati', mother_tongue: 'Arabic', religion: 'Islam',
    education_level: 'BA', occupation: 'Government Officer', employment_type: 'Full-time',
    company_industry: 'Government', monthly_income: 500000,
    about_me: 'Young Emirati professional. Love calligraphy, Arabic poetry, and the desert.',
    father_occupation: 'Government minister (retired)', mother_occupation: 'Homemaker', brothers_count: 3, sisters_count: 2,
    family_details: 'Large traditional Emirati family with strong tribal connections.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for a Muslim partner from a respectable family who values tradition and Islam.',
    contact_phone: '+971 50 5556003', contact_whatsapp: '+971 50 5556003', registered_by: 'sister',
  },

  // ── UK (3) ─────────────────────────────────────────────────────────────────
  {
    display_name: 'Yusuf I.', gender: 'male', dob: '1990-09-12', marital_status: 'never_married',
    height_cm: 177, country: 'United Kingdom', current_city: 'London',
    nationality: 'British', mother_tongue: 'English', religion: 'Islam',
    education_level: 'MSc', occupation: 'Software Architect', employment_type: 'Full-time',
    company_industry: 'Technology', monthly_income: 900000,
    about_me: 'British-Bangladeshi, born and raised in East London. Software architect at a fintech.',
    father_occupation: 'Restaurant owner', mother_occupation: 'Homemaker', brothers_count: 2, sisters_count: 1,
    family_details: 'British-Bangladeshi family, three generations in London.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a practising Muslim partner — South Asian heritage preferred — who values family.',
    contact_phone: '+44 7700 900001', contact_whatsapp: '+44 7700 900001', registered_by: 'self',
  },
  {
    display_name: 'Hana B.', gender: 'female', dob: '1994-05-08', marital_status: 'never_married',
    height_cm: 165, country: 'United Kingdom', current_city: 'Manchester',
    nationality: 'British', mother_tongue: 'English', religion: 'Islam',
    education_level: 'MBBS', occupation: 'Doctor (GP)', employment_type: 'Full-time',
    company_industry: 'Healthcare', monthly_income: 850000,
    about_me: 'GP in Manchester. Family is originally from Hyderabad. Love painting and travel.',
    father_occupation: 'Consultant doctor', mother_occupation: 'Pharmacist', brothers_count: 1, sisters_count: 0,
    family_details: 'Educated medical family settled in Manchester for 30 years.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Hoping to find a practising Muslim partner with similar academic background and a kind heart.',
    contact_phone: '+44 7700 900002', contact_whatsapp: '+44 7700 900002', registered_by: 'relative',
  },
  {
    display_name: 'James C.', gender: 'male', dob: '1986-11-30', marital_status: 'divorced',
    height_cm: 184, country: 'United Kingdom', current_city: 'Birmingham',
    nationality: 'British', mother_tongue: 'English', religion: 'Christianity',
    education_level: 'BSc', occupation: 'Civil Engineer', employment_type: 'Full-time',
    company_industry: 'Construction', monthly_income: 700000,
    about_me: 'Civil engineer with two kids. Looking for a second chance at building a family.',
    father_occupation: 'Carpenter', mother_occupation: 'Nurse', brothers_count: 0, sisters_count: 2,
    family_details: 'Warm working-class Christian family.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for someone kind and patient who is open to step-parenting and a calm family life.',
    contact_phone: '+44 7700 900003', contact_whatsapp: '+44 7700 900003', registered_by: 'self',
  },

  // ── US (2) ─────────────────────────────────────────────────────────────────
  {
    display_name: 'Ayesha M.', gender: 'female', dob: '1993-08-14', marital_status: 'never_married',
    height_cm: 162, country: 'United States', current_city: 'New York',
    nationality: 'American', mother_tongue: 'English', religion: 'Islam',
    education_level: 'JD', occupation: 'Corporate Lawyer', employment_type: 'Full-time',
    company_industry: 'Legal', monthly_income: 1500000,
    about_me: 'Pakistani-American corporate lawyer in Manhattan. Hijabi, practising, with a sharp wit.',
    father_occupation: 'Surgeon', mother_occupation: 'Architect', brothers_count: 0, sisters_count: 1,
    family_details: 'Pakistani-American family settled in New Jersey since the 90s.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for an educated, practising Muslim partner in the US who respects ambition and faith equally.',
    contact_phone: '+1 212 555 0101', contact_whatsapp: '+1 212 555 0101', registered_by: 'self',
  },
  {
    display_name: 'Daniel K.', gender: 'male', dob: '1989-01-21', marital_status: 'never_married',
    height_cm: 188, country: 'United States', current_city: 'San Francisco',
    nationality: 'American', mother_tongue: 'English', religion: 'Christianity',
    education_level: 'MS', occupation: 'Startup Founder', employment_type: 'Self-employed',
    company_industry: 'Technology', monthly_income: 2000000,
    about_me: 'Bay Area startup founder. Faith-driven, into hiking, board games, and serious coffee.',
    father_occupation: 'Pastor', mother_occupation: 'Teacher', brothers_count: 1, sisters_count: 1,
    family_details: 'Close Christian family in the Midwest.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a Christian partner with strong faith, a sense of adventure, and a kind soul.',
    contact_phone: '+1 415 555 0102', contact_whatsapp: '+1 415 555 0102', registered_by: 'self',
  },

  // ── Canada (2) ─────────────────────────────────────────────────────────────
  {
    display_name: 'Sara N.', gender: 'female', dob: '1996-10-16', marital_status: 'never_married',
    height_cm: 160, country: 'Canada', current_city: 'Toronto',
    nationality: 'Canadian', mother_tongue: 'English', religion: 'Islam',
    education_level: 'MEng', occupation: 'Software Engineer', employment_type: 'Full-time',
    company_industry: 'Technology', monthly_income: 750000,
    about_me: 'Software engineer in Toronto, originally from Karachi. Love winter sports and Pakistani cuisine.',
    father_occupation: 'Engineer', mother_occupation: 'Teacher', brothers_count: 1, sisters_count: 0,
    family_details: 'Pakistani-Canadian family, immigrated 25 years ago.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Seeking a practising Muslim partner — ideally Canadian or willing to relocate — with a good career and values.',
    contact_phone: '+1 416 555 0201', contact_whatsapp: '+1 416 555 0201', registered_by: 'self',
  },
  {
    display_name: 'Sahil B.', gender: 'male', dob: '1991-04-09', marital_status: 'never_married',
    height_cm: 178, country: 'Canada', current_city: 'Vancouver',
    nationality: 'Canadian', mother_tongue: 'Punjabi', religion: 'Sikhism',
    education_level: 'BBA', occupation: 'Real Estate Agent', employment_type: 'Self-employed',
    company_industry: 'Real estate', monthly_income: 900000,
    about_me: 'Top-performing real estate agent in Vancouver. Punjabi household with strong cultural roots.',
    father_occupation: 'Truck owner-operator', mother_occupation: 'Homemaker', brothers_count: 2, sisters_count: 0,
    family_details: 'Sikh family from Punjab, settled in BC for two decades.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for a Sikh or open-minded partner who respects culture and is happy to settle in Vancouver.',
    contact_phone: '+1 604 555 0202', contact_whatsapp: '+1 604 555 0202', registered_by: 'self',
  },

  // ── Malaysia, Singapore, Australia, Pakistan (4) ──────────────────────────
  {
    display_name: 'Aina S.', gender: 'female', dob: '1997-12-01', marital_status: 'never_married',
    height_cm: 161, country: 'Malaysia', current_city: 'Kuala Lumpur',
    nationality: 'Malaysian', mother_tongue: 'Malay', religion: 'Islam',
    education_level: 'BSc', occupation: 'Accountant', employment_type: 'Full-time',
    company_industry: 'Finance', monthly_income: 400000,
    about_me: 'Chartered accountant in KL. Love F1, durian, and Friday family iftars.',
    father_occupation: 'Government officer', mother_occupation: 'School teacher', brothers_count: 1, sisters_count: 1,
    family_details: 'Modern Malay Muslim family with strong religious roots.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Hoping to meet a practising Muslim husband who values family, ambition, and a balanced life.',
    contact_phone: '+60 12 333 5001', contact_whatsapp: '+60 12 333 5001', registered_by: 'self',
  },
  {
    display_name: 'Wei Min L.', gender: 'male', dob: '1990-06-06', marital_status: 'never_married',
    height_cm: 172, country: 'Singapore', current_city: 'Singapore',
    nationality: 'Singaporean', mother_tongue: 'Mandarin', religion: 'Buddhism',
    education_level: 'BBA', occupation: 'Management Consultant', employment_type: 'Full-time',
    company_industry: 'Consulting', monthly_income: 1100000,
    about_me: 'Management consultant in Singapore. Quiet introvert who loves jazz, books, and good food.',
    father_occupation: 'Banker', mother_occupation: 'Doctor', brothers_count: 0, sisters_count: 1,
    family_details: 'Chinese-Singaporean family with strong educational values.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a thoughtful, intellectually curious partner who values quiet, meaningful time together.',
    contact_phone: '+65 8888 5001', contact_whatsapp: '+65 8888 5001', registered_by: 'self',
  },
  {
    display_name: 'Emily T.', gender: 'female', dob: '1992-02-17', marital_status: 'never_married',
    height_cm: 170, country: 'Australia', current_city: 'Sydney',
    nationality: 'Australian', mother_tongue: 'English', religion: 'Christianity',
    education_level: 'MA', occupation: 'Graphic Designer', employment_type: 'Self-employed',
    company_industry: 'Creative', monthly_income: 600000,
    about_me: 'Freelance graphic designer in Sydney. Beach mornings, design briefs, and weekend pottery.',
    father_occupation: 'Architect', mother_occupation: 'Therapist', brothers_count: 1, sisters_count: 0,
    family_details: 'Liberal Christian Australian family.',
    willing_to_relocate: true, location_preference: 'either',
    preference_text: 'Looking for a creative, kind partner with a sense of humour and an open heart.',
    contact_phone: '+61 4 1100 5001', contact_whatsapp: '+61 4 1100 5001', registered_by: 'self',
  },
  {
    display_name: 'Bilal Q.', gender: 'male', dob: '1988-08-23', marital_status: 'divorced',
    height_cm: 180, country: 'Pakistan', current_city: 'Lahore',
    nationality: 'Pakistani', mother_tongue: 'Urdu', religion: 'Islam',
    education_level: 'MBA', occupation: 'Business Owner', employment_type: 'Self-employed',
    company_industry: 'Textile', monthly_income: 800000,
    about_me: 'Family textile business in Lahore. Divorced, one daughter aged 6.',
    father_occupation: 'Industrialist', mother_occupation: 'Homemaker', brothers_count: 2, sisters_count: 2,
    family_details: 'Large traditional Punjabi business family.',
    willing_to_relocate: false, location_preference: 'local',
    preference_text: 'Looking for a kind, religious partner who is open to step-parenting and a settled family life in Lahore.',
    contact_phone: '+92 300 555 0001', contact_whatsapp: '+92 300 555 0001', registered_by: 'self',
  },
];

if (PROFILES.length !== 30) {
  console.error(`Expected 30 profiles, got ${PROFILES.length}. Aborting.`);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI embedding (optional)
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';

async function embed(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || noEmbed) return null;
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) {
    console.warn(`  embed failed (${res.status}); continuing without embedding`);
    return null;
  }
  const data = await res.json();
  return data.data?.[0]?.embedding ?? null;
}

function buildProfileEmbeddingInput(p: DemoProfile): string {
  const parts = [
    `Gender: ${p.gender}`,
    `Age: ${ageFrom(p.dob)}`,
    `Marital: ${p.marital_status}`,
    `Religion: ${p.religion}`,
    `Country: ${p.country}, City: ${p.current_city}`,
    `Nationality: ${p.nationality}`,
    `Mother tongue: ${p.mother_tongue}`,
    `Education: ${p.education_level}, Occupation: ${p.occupation} (${p.company_industry ?? 'n/a'})`,
    `About: ${p.about_me}`,
    `Family: ${p.family_details}`,
    `Willing to relocate: ${p.willing_to_relocate}, Pref: ${p.location_preference}`,
  ];
  return parts.join(' | ');
}

function ageFrom(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Index allocation
// ─────────────────────────────────────────────────────────────────────────────

async function nextIndex(): Promise<number> {
  return db.runTransaction(async (tx) => {
    const ref = db.collection('counters').doc('profile_index');
    const snap = await tx.get(ref);
    const current = snap.exists ? (snap.data()?.value as number) : 999;
    const next = current + 1;
    tx.set(ref, { value: next }, { merge: true });
    return next;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${PROFILES.length} demo profiles (embed: ${!noEmbed && !!process.env.OPENAI_API_KEY})\n`);

  let created = 0;
  let updated = 0;

  for (let i = 0; i < PROFILES.length; i++) {
    const p = PROFILES[i]!;
    const seq = String(i + 1).padStart(2, '0');
    const uid = `demo_user_${seq}`;
    const email = `demo${seq}@ruhmate.test`;

    const userRef = db.collection('users').doc(uid);
    const profileRef = db.collection('profiles').doc(uid);
    const existing = await profileRef.get();
    const isNew = !existing.exists;

    // Allocate index only on first-time create
    let indexNumber: number;
    if (isNew) {
      indexNumber = await nextIndex();
    } else {
      indexNumber = (existing.data()?.index_number as number) ?? (await nextIndex());
    }

    // Build embedding input + skip if hash unchanged
    const embeddingInput = buildProfileEmbeddingInput(p);
    const embeddingHash = sha256(embeddingInput);
    const prevHash = existing.data()?.embedding_input_hash as string | undefined;

    let embedding: number[] | null = null;
    if (embeddingHash !== prevHash) {
      embedding = await embed(embeddingInput);
    }

    const profileDoc: Record<string, unknown> = {
      id: uid,
      user_id: uid,
      index_number: indexNumber,
      is_demo: true,
      status: 'published',

      display_name: p.display_name,
      gender: p.gender,
      date_of_birth: Timestamp.fromDate(new Date(p.dob)),
      marital_status: p.marital_status,
      height_cm: p.height_cm,
      country: p.country,
      current_city: p.current_city,
      district: p.district ?? '',
      nationality: p.nationality,
      ethnicity: p.ethnicity ?? '',
      mother_tongue: p.mother_tongue,
      religion: p.religion,

      education_level: p.education_level,
      occupation: p.occupation,
      employment_type: p.employment_type,
      company_industry: p.company_industry ?? '',
      monthly_income: p.monthly_income ?? null,
      about_me: p.about_me,

      father_occupation: p.father_occupation,
      mother_occupation: p.mother_occupation,
      brothers_count: p.brothers_count,
      sisters_count: p.sisters_count,
      family_details: p.family_details,

      willing_to_relocate: p.willing_to_relocate,
      location_preference: p.location_preference,

      preference_text: p.preference_text,
      contact_phone: p.contact_phone,
      contact_whatsapp: p.contact_whatsapp,
      registered_by: p.registered_by,

      embedding_input_hash: embeddingHash,
      updated_at: FieldValue.serverTimestamp(),
    };
    if (embedding) {
      profileDoc.embedding = embedding;
      profileDoc.last_embedded_at = FieldValue.serverTimestamp();
    }
    if (isNew) profileDoc.created_at = FieldValue.serverTimestamp();

    const userDoc: Record<string, unknown> = {
      uid,
      full_name: p.display_name,
      email,
      email_verified: true,
      phone: p.contact_phone,
      role: 'user',
      status: 'active',
      points_balance: 0,
      has_profile: true,
      auth_providers: ['password'],
      is_demo: true,
      preference_text: p.preference_text,
      updated_at: FieldValue.serverTimestamp(),
    };
    if (isNew) userDoc.created_at = FieldValue.serverTimestamp();

    await userRef.set(userDoc, { merge: true });
    await profileRef.set(profileDoc, { merge: true });

    if (isNew) created++;
    else updated++;

    console.log(`  ${isNew ? '✓ created' : '↻ updated'}  #${indexNumber}  ${p.display_name.padEnd(15)}  ${p.country}`);
  }

  console.log(`\nDone. Created: ${created}  Updated: ${updated}  Total demo profiles: ${PROFILES.length}`);
  console.log(`\nTo remove: npx tsx scripts/delete-demo-profiles.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
