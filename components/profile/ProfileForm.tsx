'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioPill } from '@/components/ui/radio-group';
import { PhoneVerifyModal } from '@/components/profile/PhoneVerifyModal';
import { normalizePhoneE164 } from '@/lib/utils/phone';
import {
  ABOUT_ME_MAX,
  CITY_OTHER,
  COUNTRIES,
  COUNTRY_CITIES,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  FAMILY_DETAILS_MAX,
  GENDERS,
  LOCATION_PREFERENCES,
  MARITAL_STATUSES,
  MOTHER_TONGUES,
  PREFERENCE_TEXT_MAX,
  REGISTERED_BY_OPTIONS,
} from '@/lib/profile/constants';
import {
  cmToFeetInches,
  feetInchesToCm,
  HEIGHT_FEET_OPTIONS,
  HEIGHT_INCH_OPTIONS,
} from '@/lib/utils/height';

interface FormState {
  registered_by: '' | 'self' | 'son' | 'daughter' | 'brother' | 'sister' | 'relative' | 'friend';
  display_name: string;
  gender: '' | 'male' | 'female';
  date_of_birth: string;
  marital_status: '' | 'never_married' | 'divorced' | 'widowed';
  height_feet: string;
  height_inches: string;
  country: string;
  city_choice: string; // dropdown value — may be "Other"
  city_custom: string; // free-text when city_choice is "Other" OR country has no preset list
  district: string;
  nationality: string;
  ethnicity: string;
  mother_tongue: string;

  education_level: string;
  occupation: string;
  employment_type: string;
  company_industry: string;
  monthly_income: string;
  about_me: string;

  father_occupation: string;
  mother_occupation: string;
  brothers_count: string;
  sisters_count: string;
  family_details: string;

  willing_to_relocate: boolean;
  location_preference: '' | 'local' | 'abroad' | 'either';

  preference_text: string;

  contact_phone: string;
  contact_whatsapp: string;
}

const EMPTY: FormState = {
  registered_by: '',
  display_name: '',
  gender: '',
  date_of_birth: '',
  marital_status: '',
  height_feet: '',
  height_inches: '',
  country: '',
  city_choice: '',
  city_custom: '',
  district: '',
  nationality: '',
  ethnicity: '',
  mother_tongue: '',
  education_level: '',
  occupation: '',
  employment_type: '',
  company_industry: '',
  monthly_income: '',
  about_me: '',
  father_occupation: '',
  mother_occupation: '',
  brothers_count: '0',
  sisters_count: '0',
  family_details: '',
  willing_to_relocate: false,
  location_preference: '',
  preference_text: '',
  contact_phone: '',
  contact_whatsapp: '',
};

interface ServerProfile {
  registered_by?: 'self' | 'son' | 'daughter' | 'brother' | 'sister' | 'relative' | 'friend';
  display_name?: string;
  gender?: 'male' | 'female';
  date_of_birth?: string | null;
  marital_status?: 'never_married' | 'divorced' | 'widowed';
  height_cm?: number;
  country?: string;
  current_city?: string;
  district?: string;
  nationality?: string;
  ethnicity?: string;
  mother_tongue?: string;
  education_level?: string;
  occupation?: string;
  employment_type?: string;
  company_industry?: string;
  monthly_income?: number;
  about_me?: string;
  father_occupation?: string;
  mother_occupation?: string;
  brothers_count?: number;
  sisters_count?: number;
  family_details?: string;
  willing_to_relocate?: boolean;
  location_preference?: 'local' | 'abroad' | 'either';
  preference_text?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  status?: 'draft' | 'published' | 'hidden';
  index_number?: number;
  phone_verified?: boolean;
  verified_phone_number?: string;
}

function hydrate(profile: ServerProfile | null): FormState {
  if (!profile) return EMPTY;
  const country = profile.country ?? '';
  const presetCities = COUNTRY_CITIES[country] ?? null;
  const savedCity = profile.current_city ?? '';
  const isPresetMatch = presetCities ? presetCities.includes(savedCity) : false;
  const fi = profile.height_cm ? cmToFeetInches(profile.height_cm) : null;
  return {
    registered_by: profile.registered_by ?? '',
    display_name: profile.display_name ?? '',
    gender: profile.gender ?? '',
    date_of_birth: profile.date_of_birth ? profile.date_of_birth.slice(0, 10) : '',
    marital_status: profile.marital_status ?? '',
    height_feet: fi ? String(fi.feet) : '',
    height_inches: fi ? String(fi.inches) : '',
    country,
    city_choice: isPresetMatch ? savedCity : presetCities ? CITY_OTHER : '',
    city_custom: isPresetMatch ? '' : savedCity,
    district: profile.district ?? '',
    nationality: profile.nationality ?? '',
    ethnicity: profile.ethnicity ?? '',
    mother_tongue: profile.mother_tongue ?? '',
    education_level: profile.education_level ?? '',
    occupation: profile.occupation ?? '',
    employment_type: profile.employment_type ?? '',
    company_industry: profile.company_industry ?? '',
    monthly_income: profile.monthly_income ? String(profile.monthly_income) : '',
    about_me: profile.about_me ?? '',
    father_occupation: profile.father_occupation ?? '',
    mother_occupation: profile.mother_occupation ?? '',
    brothers_count:
      typeof profile.brothers_count === 'number' ? String(profile.brothers_count) : '0',
    sisters_count:
      typeof profile.sisters_count === 'number' ? String(profile.sisters_count) : '0',
    family_details: profile.family_details ?? '',
    willing_to_relocate: profile.willing_to_relocate ?? false,
    location_preference: profile.location_preference ?? '',
    preference_text: profile.preference_text ?? '',
    contact_phone: profile.contact_phone ?? '',
    contact_whatsapp: profile.contact_whatsapp ?? '',
  };
}

function resolveCity(state: FormState): string {
  const presetCities = COUNTRY_CITIES[state.country] ?? null;
  if (!presetCities) {
    // Country has no preset list — city_custom is the source of truth.
    return state.city_custom.trim();
  }
  if (state.city_choice === CITY_OTHER) return state.city_custom.trim();
  return state.city_choice.trim();
}

function toPayload(state: FormState): Record<string, unknown> {
  return {
    registered_by: state.registered_by || undefined,
    display_name: state.display_name.trim(),
    gender: state.gender || undefined,
    date_of_birth: state.date_of_birth || undefined,
    marital_status: state.marital_status || undefined,
    height_cm:
      state.height_feet !== ''
        ? feetInchesToCm(Number(state.height_feet), Number(state.height_inches || '0'))
        : undefined,
    country: state.country || undefined,
    current_city: resolveCity(state) || undefined,
    district: state.district.trim() || undefined,
    nationality: state.nationality.trim() || undefined,
    ethnicity: state.ethnicity.trim() || undefined,
    mother_tongue: state.mother_tongue || undefined,
    education_level: state.education_level || undefined,
    occupation: state.occupation.trim() || undefined,
    employment_type: state.employment_type || undefined,
    company_industry: state.company_industry.trim() || undefined,
    monthly_income: state.monthly_income ? Number(state.monthly_income) : undefined,
    about_me: state.about_me.trim() || undefined,
    father_occupation: state.father_occupation.trim() || undefined,
    mother_occupation: state.mother_occupation.trim() || undefined,
    brothers_count: state.brothers_count ? Number(state.brothers_count) : undefined,
    sisters_count: state.sisters_count ? Number(state.sisters_count) : undefined,
    family_details: state.family_details.trim() || undefined,
    willing_to_relocate: state.willing_to_relocate,
    location_preference: state.location_preference || undefined,
    preference_text: state.preference_text.trim() || undefined,
    contact_phone: state.contact_phone.trim() || undefined,
    contact_whatsapp: state.contact_whatsapp.trim() || undefined,
  };
}

interface Props {
  initialProfile: ServerProfile | null;
}

export function ProfileForm({ initialProfile }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(hydrate(initialProfile));
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showOtp, setShowOtp] = useState(false);
  // 'publish' = OTP gate triggered by the Publish button; 'verify' = standalone
  // "Verify this number" button (verifies without publishing the profile).
  const [otpMode, setOtpMode] = useState<'verify' | 'publish'>('publish');
  const [phoneVerified, setPhoneVerified] = useState<boolean>(
    initialProfile?.phone_verified === true,
  );
  const [verifiedNumber, setVerifiedNumber] = useState<string>(
    initialProfile?.verified_phone_number ?? '',
  );

  // Verified only counts if the verified number still matches the typed one.
  const phoneIsVerified =
    phoneVerified &&
    state.contact_phone.trim() !== '' &&
    normalizePhoneE164(verifiedNumber) === normalizePhoneE164(state.contact_phone);

  const published = initialProfile?.status === 'published';
  const indexNumber = initialProfile?.index_number;

  const patch = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Debounced draft autosave whenever the state changes
  useEffect(() => {
    if (publishing) return;
    const t = setTimeout(async () => {
      try {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_draft', profile: toPayload(state) }),
        });
        setDraftStatus(`Draft saved · ${new Date().toLocaleTimeString()}`);
      } catch {
        // silent
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function handleSaveDraft() {
    setSavingDraft(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_draft', profile: toPayload(state) }),
      });
      const body = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !body.success) {
        setError(body.error ?? 'Could not save draft.');
      } else {
        setDraftStatus(`Draft saved · ${new Date().toLocaleTimeString()}`);
      }
    } finally {
      setSavingDraft(false);
    }
  }

  async function doPublish() {
    setPublishing(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', profile: toPayload(state) }),
      });
      const body = (await res.json()) as {
        success: boolean;
        error?: string;
        code?: string;
        details?: { fieldErrors: Record<string, string[]> };
      };
      if (!res.ok || !body.success) {
        // Phone not verified → open the OTP modal instead of a generic error.
        if (res.status === 403 && body.code === 'phone_unverified') {
          setOtpMode('publish');
          setShowOtp(true);
          return;
        }
        setError(body.error ?? 'Could not publish profile.');
        if (body.details?.fieldErrors) setFieldErrors(body.details.fieldErrors);
      } else {
        setShowOtp(false);
        router.refresh();
      }
    } finally {
      setPublishing(false);
    }
  }

  function handlePublish(e: FormEvent) {
    e.preventDefault();
    void doPublish();
  }

  // OTP verification succeeded (the modal already recorded it server-side).
  async function handleVerified() {
    setShowOtp(false);
    setPhoneVerified(true);
    setVerifiedNumber(state.contact_phone);
    // Only auto-continue to publish when the modal was opened by the Publish
    // button. Standalone verification just flips the badge to "verified".
    if (otpMode === 'publish') {
      await doPublish();
    }
  }

  const characterCount = useMemo(
    () => ({
      about_me: state.about_me.length,
      family_details: state.family_details.length,
      preference_text: state.preference_text.length,
    }),
    [state.about_me, state.family_details, state.preference_text],
  );

  const presetCities = COUNTRY_CITIES[state.country] ?? null;
  const cityNeedsCustomInput =
    !!state.country &&
    (presetCities === null || state.city_choice === CITY_OTHER);

  return (
    <form onSubmit={handlePublish} className="flex flex-col gap-8">
      {published && indexNumber && (
        <div className="rounded-card border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          Published as <strong>Profile #{indexNumber}</strong>. This unique number stays with your
          account — edits will re-publish under the same number.
        </div>
      )}

      <Section
        title="Who is this profile for?"
        description="Tell us who is registering this profile. This helps the family viewing experience feel natural."
      >
        <Field label="Registering on behalf of" error={fieldErrors.registered_by} required>
          <RadioGroup
            value={state.registered_by || undefined}
            onValueChange={(v) => patch('registered_by', v as FormState['registered_by'])}
          >
            {REGISTERED_BY_OPTIONS.map((o) => (
              <RadioPill key={o.value} value={o.value} label={o.label} />
            ))}
          </RadioGroup>
        </Field>
      </Section>

      <Section title="Basic information" description="Visible on profile cards and detail page.">
        <Field label="Profile display name" error={fieldErrors.display_name} required>
          <Input
            value={state.display_name}
            onChange={(e) => patch('display_name', e.target.value)}
            placeholder="e.g. Family of Profile 1021"
            maxLength={80}
          />
        </Field>
        <Field label="Gender" error={fieldErrors.gender} required>
          <RadioGroup
            value={state.gender || undefined}
            onValueChange={(v) => patch('gender', v as FormState['gender'])}
          >
            {GENDERS.map((g) => (
              <RadioPill key={g.value} value={g.value} label={g.label} />
            ))}
          </RadioGroup>
        </Field>
        <Field label="Date of birth" error={fieldErrors.date_of_birth} required>
          <Input
            type="date"
            value={state.date_of_birth}
            onChange={(e) => patch('date_of_birth', e.target.value)}
          />
        </Field>
        <Field label="Marital status" error={fieldErrors.marital_status} required>
          <RadioGroup
            value={state.marital_status || undefined}
            onValueChange={(v) => patch('marital_status', v as FormState['marital_status'])}
          >
            {MARITAL_STATUSES.map((s) => (
              <RadioPill key={s.value} value={s.value} label={s.label} />
            ))}
          </RadioGroup>
        </Field>
        <Field label="Height" error={fieldErrors.height_cm} required>
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={state.height_feet}
              onChange={(e) => patch('height_feet', e.target.value)}
              placeholder="Feet"
              aria-label="Height — feet"
            >
              {HEIGHT_FEET_OPTIONS.map((f) => (
                <option key={f} value={String(f)}>
                  {f} ft
                </option>
              ))}
            </Select>
            <Select
              value={state.height_inches}
              onChange={(e) => patch('height_inches', e.target.value)}
              placeholder="Inches"
              aria-label="Height — inches"
            >
              {HEIGHT_INCH_OPTIONS.map((i) => (
                <option key={i} value={String(i)}>
                  {i} in
                </option>
              ))}
            </Select>
          </div>
        </Field>

        <Field label="Country" error={fieldErrors.country} required>
          <Select
            value={state.country}
            onChange={(e) => {
              const next = e.target.value;
              setState((prev) => ({
                ...prev,
                country: next,
                // Reset city choice when country changes
                city_choice: '',
                city_custom: '',
              }));
            }}
            placeholder="Select a country"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>

        {state.country && presetCities && (
          <Field label="Current city" error={fieldErrors.current_city} required>
            <Select
              value={state.city_choice}
              onChange={(e) => patch('city_choice', e.target.value)}
              placeholder="Select a city"
            >
              {presetCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {cityNeedsCustomInput && (
          <Field
            label={presetCities ? 'Which city?' : 'Current city'}
            error={fieldErrors.current_city}
            required
          >
            <Input
              value={state.city_custom}
              onChange={(e) => patch('city_custom', e.target.value)}
              placeholder="Type your city"
            />
          </Field>
        )}

        {state.country === 'Sri Lanka' && (
          <Field label="District (optional)" error={fieldErrors.district}>
            <Input
              value={state.district}
              onChange={(e) => patch('district', e.target.value)}
              placeholder="e.g. Colombo"
            />
          </Field>
        )}

        <Field label="Nationality" error={fieldErrors.nationality} required>
          <Input
            value={state.nationality}
            onChange={(e) => patch('nationality', e.target.value)}
            placeholder="e.g. Sri Lankan"
          />
        </Field>
        <Field label="Ethnicity (optional)" error={fieldErrors.ethnicity}>
          <Input
            value={state.ethnicity}
            onChange={(e) => patch('ethnicity', e.target.value)}
          />
        </Field>
        <Field label="Mother tongue" error={fieldErrors.mother_tongue} required>
          <Select
            value={state.mother_tongue}
            onChange={(e) => patch('mother_tongue', e.target.value)}
            placeholder="Select a language"
          >
            {MOTHER_TONGUES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section title="Personal details">
        <Field label="Education level" error={fieldErrors.education_level} required>
          <Select
            value={state.education_level}
            onChange={(e) => patch('education_level', e.target.value)}
            placeholder="Select education"
          >
            {EDUCATION_LEVELS.map((edu) => (
              <option key={edu} value={edu}>
                {edu}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Occupation" error={fieldErrors.occupation} required>
          <Input
            value={state.occupation}
            onChange={(e) => patch('occupation', e.target.value)}
          />
        </Field>
        <Field label="Employment type" error={fieldErrors.employment_type} required>
          <Select
            value={state.employment_type}
            onChange={(e) => patch('employment_type', e.target.value)}
            placeholder="Select employment"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Company / Industry (optional)" error={fieldErrors.company_industry}>
          <Input
            value={state.company_industry}
            onChange={(e) => patch('company_industry', e.target.value)}
          />
        </Field>
        <Field
          label="Monthly income, LKR (optional)"
          hint="Never shown publicly. Only used by AI ranking."
          error={fieldErrors.monthly_income}
        >
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={state.monthly_income}
            onChange={(e) => patch('monthly_income', e.target.value)}
          />
        </Field>
        <Field
          label="Short introduction / About me"
          hint={`${characterCount.about_me}/${ABOUT_ME_MAX}`}
          error={fieldErrors.about_me}
          required
        >
          <Textarea
            value={state.about_me}
            onChange={(e) => patch('about_me', e.target.value.slice(0, ABOUT_ME_MAX))}
            placeholder="Three or four sentences — interests, values, what your family is like."
            rows={4}
          />
        </Field>
      </Section>

      <Section title="Family information">
        <Field label="Father's occupation" error={fieldErrors.father_occupation} required>
          <Input
            value={state.father_occupation}
            onChange={(e) => patch('father_occupation', e.target.value)}
          />
        </Field>
        <Field label="Mother's occupation" error={fieldErrors.mother_occupation} required>
          <Input
            value={state.mother_occupation}
            onChange={(e) => patch('mother_occupation', e.target.value)}
          />
        </Field>
        <Field label="Number of brothers" error={fieldErrors.brothers_count} required>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={state.brothers_count}
            onChange={(e) => patch('brothers_count', e.target.value)}
          />
        </Field>
        <Field label="Number of sisters" error={fieldErrors.sisters_count} required>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={state.sisters_count}
            onChange={(e) => patch('sisters_count', e.target.value)}
          />
        </Field>
        <Field
          label="Family details"
          hint={`${characterCount.family_details}/${FAMILY_DETAILS_MAX}`}
          error={fieldErrors.family_details}
          required
        >
          <Textarea
            value={state.family_details}
            onChange={(e) => patch('family_details', e.target.value.slice(0, FAMILY_DETAILS_MAX))}
            placeholder="Where the family is from, siblings' situations, values, etc."
            rows={4}
          />
        </Field>
      </Section>

      <Section title="Lifestyle">
        <Field label="Willing to relocate?">
          <Checkbox
            checked={state.willing_to_relocate}
            onChange={(e) => patch('willing_to_relocate', e.target.checked)}
            label="Yes, open to moving for the right match"
          />
        </Field>
        <Field label="Location preference" error={fieldErrors.location_preference} required>
          <RadioGroup
            value={state.location_preference || undefined}
            onValueChange={(v) => patch('location_preference', v as FormState['location_preference'])}
          >
            {LOCATION_PREFERENCES.map((p) => (
              <RadioPill key={p.value} value={p.value} label={p.label} />
            ))}
          </RadioGroup>
        </Field>
      </Section>

      <Section
        title="What you're looking for"
        description="The AI uses this free-text description to rank the best matches at the top of your feed."
      >
        <Field
          label="Describe your ideal match"
          hint={`${characterCount.preference_text}/${PREFERENCE_TEXT_MAX}`}
          error={fieldErrors.preference_text}
          required
        >
          <Textarea
            value={state.preference_text}
            onChange={(e) =>
              patch('preference_text', e.target.value.slice(0, PREFERENCE_TEXT_MAX))
            }
            placeholder="Values, family background, education, profession, location preferences — anything that matters."
            rows={5}
          />
        </Field>
      </Section>

      <Section
        title="Contact details"
        description="Hidden until another user spends points to reveal. Your phone number must be verified by OTP before your profile can be published."
      >
        <Field label="Phone number" error={fieldErrors.contact_phone} required>
          <Input
            type="tel"
            value={state.contact_phone}
            onChange={(e) => patch('contact_phone', e.target.value)}
            placeholder="+94 7X XXX XXXX"
          />
          {phoneIsVerified ? (
            <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <span aria-hidden>✓</span> Phone verified
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOtpMode('verify');
                setShowOtp(true);
              }}
              disabled={!state.contact_phone.trim()}
              className="mt-2 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-rose-deep underline underline-offset-2 transition-colors hover:text-rose disabled:cursor-not-allowed disabled:text-ink-faint disabled:no-underline"
            >
              Verify this number
            </button>
          )}
        </Field>
        <Field
          label="WhatsApp number"
          hint="Same format. Will be shown as a wa.me link."
          error={fieldErrors.contact_whatsapp}
          required
        >
          <Input
            type="tel"
            value={state.contact_whatsapp}
            onChange={(e) => patch('contact_whatsapp', e.target.value)}
            placeholder="+94 7X XXX XXXX"
          />
        </Field>
      </Section>

      {error && (
        <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-between gap-3 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
        <span className="text-xs text-ink-muted">{draftStatus ?? 'Draft autosaves while you type.'}</span>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={savingDraft}>
            {savingDraft ? 'Saving…' : 'Save draft'}
          </Button>
          <Button type="submit" disabled={publishing}>
            {publishing ? 'Publishing…' : published ? 'Update & republish' : 'Publish profile'}
          </Button>
        </div>
      </div>

      {showOtp && (
        <PhoneVerifyModal
          phoneRaw={state.contact_phone}
          actionLabel={otpMode === 'publish' ? 'Verify & Publish' : 'Verify'}
          onVerified={handleVerified}
          onClose={() => setShowOtp(false)}
        />
      )}
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-6">
      <header className="mb-5">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </header>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string[];
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>
          {label} {required && <span className="text-accent">*</span>}
        </Label>
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </div>
      {children}
      {error && error.length > 0 && <p className="text-xs text-red-600">{error[0]}</p>}
    </div>
  );
}
