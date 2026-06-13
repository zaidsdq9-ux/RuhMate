import { createHash } from 'node:crypto';
import { ageFromDob } from '@/lib/validation/profile';

interface ProfileLike {
  gender?: string;
  date_of_birth?: string | Date;
  marital_status?: string;
  registered_by?: string;
  ethnicity?: string;
  mother_tongue?: string;
  country?: string;
  current_city?: string;
  district?: string;
  nationality?: string;
  education_level?: string;
  occupation?: string;
  employment_type?: string;
  company_industry?: string;
  about_me?: string;
  father_occupation?: string;
  mother_occupation?: string;
  family_details?: string;
  willing_to_relocate?: boolean;
  location_preference?: string;
}

function toIsoDate(input: string | Date | undefined): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  return input.toISOString();
}

export function buildProfileEmbeddingInput(p: ProfileLike): string {
  const iso = toIsoDate(p.date_of_birth);
  const age = iso ? ageFromDob(iso) : null;
  const lines = [
    `${p.gender ?? ''} ${age ?? ''} ${p.marital_status ?? ''}`.trim(),
    `Profile registered by: ${p.registered_by ?? 'self'}.`,
    `Ethnicity: ${p.ethnicity ?? ''}. Mother tongue: ${p.mother_tongue ?? ''}.`,
    `Lives in ${p.current_city ?? ''}${p.district ? ', ' + p.district : ''}${p.country ? ', ' + p.country : ''}. Nationality: ${p.nationality ?? ''}.`,
    `Education: ${p.education_level ?? ''}. Works as ${p.occupation ?? ''} (${p.employment_type ?? ''}${
      p.company_industry ? `, ${p.company_industry}` : ''
    }).`,
    `Family — Father: ${p.father_occupation ?? ''}. Mother: ${p.mother_occupation ?? ''}. ${
      p.family_details ?? ''
    }`,
    `Lifestyle — Willing to relocate: ${p.willing_to_relocate ? 'yes' : 'no'}. Prefers: ${
      p.location_preference ?? 'either'
    }.`,
    `About: ${p.about_me ?? ''}`,
  ];
  return lines
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

export function hashEmbeddingInput(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
