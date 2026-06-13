export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

export const MARITAL_STATUSES = [
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
] as const;

export const LOCATION_PREFERENCES = [
  { value: 'local', label: 'Local' },
  { value: 'abroad', label: 'Abroad' },
  { value: 'either', label: 'Either' },
] as const;

export const REGISTERED_BY_OPTIONS = [
  { value: 'self', label: 'Myself' },
  { value: 'son', label: 'My son' },
  { value: 'daughter', label: 'My daughter' },
  { value: 'brother', label: 'My brother' },
  { value: 'sister', label: 'My sister' },
  { value: 'relative', label: 'Another relative' },
  { value: 'friend', label: 'A friend' },
] as const;

export type RegisteredBy = (typeof REGISTERED_BY_OPTIONS)[number]['value'];

export const EDUCATION_LEVELS = [
  'High School',
  "Diploma / Vocational",
  "Bachelor's",
  "Master's",
  'PhD / Doctorate',
  'Professional Qualification',
  'Other',
] as const;

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Self-employed',
  'Business Owner',
  'Government',
  'Freelancer',
  'Student',
  'Homemaker',
  'Other',
] as const;

export const MOTHER_TONGUES = [
  'Sinhala',
  'Tamil',
  'English',
  'Malayalam',
  'Urdu',
  'Arabic',
  'Other',
] as const;

export const COUNTRIES = [
  'Sri Lanka',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'India',
  'Pakistan',
  'Bangladesh',
  'Maldives',
  'Singapore',
  'Malaysia',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Other',
] as const;

export type Country = (typeof COUNTRIES)[number];

/**
 * Cities per country. Includes the standard list + a synthetic "Other" entry
 * which the form treats as "show a free-text input".
 *
 * If a country isn't enumerated here, the form falls back to a single free-text
 * input for the city.
 */
export const COUNTRY_CITIES: Record<string, readonly string[]> = {
  'Sri Lanka': [
    'Colombo',
    'Dehiwala-Mount Lavinia',
    'Moratuwa',
    'Negombo',
    'Sri Jayawardenepura Kotte',
    'Kandy',
    'Galle',
    'Matara',
    'Jaffna',
    'Trincomalee',
    'Batticaloa',
    'Anuradhapura',
    'Polonnaruwa',
    'Kurunegala',
    'Ratnapura',
    'Badulla',
    'Nuwara Eliya',
    'Hambantota',
    'Kalmunai',
    'Vavuniya',
    'Other',
  ],
  'United Arab Emirates': [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Al Ain',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
    'Other',
  ],
  'Saudi Arabia': [
    'Riyadh',
    'Jeddah',
    'Mecca',
    'Medina',
    'Dammam',
    'Khobar',
    'Tabuk',
    'Abha',
    'Taif',
    'Yanbu',
    'Other',
  ],
  Qatar: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Lusail', 'Other'],
  Kuwait: ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Other'],
  Bahrain: ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town', 'Other'],
  Oman: ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Other'],
  India: [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Hyderabad',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Kochi',
    'Trivandrum',
    'Other',
  ],
  Pakistan: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Other'],
  Bangladesh: ['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Other'],
  Maldives: ['Malé', 'Addu City', 'Other'],
  Singapore: ['Singapore', 'Other'],
  Malaysia: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Kota Kinabalu', 'Other'],
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Other'],
  'United States': [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Dallas',
    'San Francisco',
    'Washington DC',
    'Atlanta',
    'Boston',
    'Other',
  ],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Other'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Other'],
};

export const CITY_OTHER = 'Other';

export const MIN_AGE_YEARS = 18;
export const MAX_AGE_YEARS = 80;

export const ABOUT_ME_MAX = 600;
export const FAMILY_DETAILS_MAX = 600;
export const PREFERENCE_TEXT_MAX = 800;
