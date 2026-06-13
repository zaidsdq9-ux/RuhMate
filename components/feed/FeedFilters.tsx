'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { COUNTRIES, MARITAL_STATUSES } from '@/lib/profile/constants';

// "any" is a real sentinel value, not empty — empty would be stripped from the
// URL and the server would fall back to auto-gender (opposite of viewer). The
// user picking "Any" means "show everyone", which must persist in the URL.
const GENDER_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export function FeedFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(form: FormData) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of form.entries()) {
      const v = String(value).trim();
      if (v) next.set(key, v);
      else next.delete(key);
    }
    // Strip noisy default that the user didn't actually choose: if gender came
    // back as "any" AND nothing else is set, treat it like a no-op so the URL
    // stays clean. (Server still treats "any" as "skip auto-gender" when set.)
    next.delete('cursor');
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `/feed?${qs}` : '/feed');
    });
  }

  function reset() {
    startTransition(() => {
      router.push('/feed');
    });
  }

  // Active filter count for the mobile summary chip
  const activeCount = ['gender', 'min_age', 'max_age', 'country', 'city', 'marital_status']
    .filter((k) => (params.get(k) ?? '').length > 0).length;

  return (
    <details className="group rounded-card border border-line bg-white open:shadow-card" open>
      <summary className="flex cursor-pointer items-center justify-between gap-3 list-none px-5 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-rose-deep">
            <path d="M4 5h16l-6 8v6l-4-2v-4z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="rounded-pill bg-rose-soft px-1.5 py-0.5 text-[11px] font-semibold text-rose-deep">{activeCount}</span>
          )}
        </span>
        <span className="text-xs text-ink-muted transition-transform group-open:rotate-180">▾</span>
      </summary>
    <form
      action={update}
      className="grid gap-4 border-t border-line bg-white p-5 md:grid-cols-6"
    >
      {/* `key` ties the input's identity to the current URL value. Uncontrolled
         inputs only read defaultValue on mount, so we force a remount whenever
         the URL state changes (e.g. after Apply / Reset). Without this, the
         field would not reflect URL state after navigation. */}
      <div className="grid gap-1.5">
        <Label htmlFor="gender">Gender</Label>
        <Select
          key={`g:${params.get('gender') ?? 'any'}`}
          id="gender"
          name="gender"
          defaultValue={params.get('gender') ?? 'any'}
        >
          {GENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="min_age">Min age</Label>
        <Input
          key={`min:${params.get('min_age') ?? ''}`}
          id="min_age"
          name="min_age"
          type="number"
          min={18}
          max={80}
          defaultValue={params.get('min_age') ?? ''}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="max_age">Max age</Label>
        <Input
          key={`max:${params.get('max_age') ?? ''}`}
          id="max_age"
          name="max_age"
          type="number"
          min={18}
          max={80}
          defaultValue={params.get('max_age') ?? ''}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="country">Country</Label>
        <Select
          key={`c:${params.get('country') ?? ''}`}
          id="country"
          name="country"
          defaultValue={params.get('country') ?? ''}
        >
          <option value="">Any</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input
          key={`city:${params.get('city') ?? ''}`}
          id="city"
          name="city"
          placeholder="e.g. Colombo"
          defaultValue={params.get('city') ?? ''}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="marital_status">Marital</Label>
        <Select
          key={`m:${params.get('marital_status') ?? ''}`}
          id="marital_status"
          name="marital_status"
          defaultValue={params.get('marital_status') ?? ''}
        >
          <option value="">Any</option>
          {MARITAL_STATUSES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row md:col-span-6">
        <Button type="submit" disabled={pending} className="px-6">
          {pending ? 'Updating…' : 'Apply filters'}
        </Button>
        <Button type="button" variant="outline" onClick={reset} disabled={pending}>
          Reset
        </Button>
      </div>
    </form>
    </details>
  );
}
