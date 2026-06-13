import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          id={inputId}
          ref={ref}
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-line text-accent focus:ring-accent',
            className,
          )}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
