// src/components/ui2/checkbox.tsx
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormFieldProps } from './types';

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    FormFieldProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { className, size = 'md', label, required, error, helperText, id, ...props },
    ref
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const descriptionId = helperText || error ? `${inputId}-description` : undefined;

    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <CheckboxPrimitive.Root
            ref={ref}
            id={inputId}
            className={cn(
              'peer shrink-0 rounded-sm border border-gray-300 dark:border-border bg-light-light ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-muted',
              sizeClasses[size],
              error && 'border-destructive',
              className
            )}
            aria-required={required ? true : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            {...props}
          >
            <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
              <Check className="h-4 w-4 dark:text-white" />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
        </div>

        {(label || helperText || error) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'font-medium text-foreground dark:text-muted-foreground',
                  props.disabled && 'opacity-50'
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </label>
            )}
            {(helperText || error) && (
              <p
                id={descriptionId}
                className={cn(
                  'text-sm',
                  error ? 'text-destructive' : 'text-muted-foreground dark:text-muted-foreground'
                )}
              >
                {error || helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

