import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, value, defaultValue, ...props }, ref) => {
    // Bug guard: previously this component did `value={value ?? ''}` which
    // forced the <select> into controlled mode with an empty string. That
    // overrode any `defaultValue` callers passed and made user selections
    // silently snap back to "" on the next render — every dropdown felt
    // dead. We now pass through only what was actually given: if the caller
    // wants controlled, they pass `value` + `onChange`; otherwise we honour
    // `defaultValue` and stay uncontrolled.
    const controlled = value !== undefined;
    const muted =
      (controlled && (value === '' || value == null)) ||
      (!controlled && (defaultValue === '' || defaultValue == null));
    return (
      <div className="relative">
        <select
          ref={ref}
          {...(controlled ? { value } : { defaultValue })}
          className={cn(
            'flex h-10 w-full appearance-none rounded-btn border border-line bg-white px-3 pr-9 text-sm text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            muted && 'text-ink-muted',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
      </div>
    );
  },
);
Select.displayName = 'Select';
