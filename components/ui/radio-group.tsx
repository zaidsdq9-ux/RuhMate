'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn('flex flex-wrap gap-2', className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export interface RadioPillProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: React.ReactNode;
}

export const RadioPill = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioPillProps
>(({ className, label, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'rounded-full border border-line bg-white px-4 py-2 text-sm text-ink transition-colors',
      'hover:bg-surface-blush',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
      'data-[state=checked]:border-accent data-[state=checked]:bg-surface-blush data-[state=checked]:text-accent',
      className,
    )}
    {...props}
  >
    {label}
  </RadioGroupPrimitive.Item>
));
RadioPill.displayName = 'RadioPill';
