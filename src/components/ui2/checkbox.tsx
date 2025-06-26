// src/components/ui2/checkbox.tsx
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormFieldProps } from './types';

interface CheckboxProps extends 
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
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
>(({ className, size = 'md', label, required, error, helperText, ...props }, ref) => (
  <div className="relative flex items-start">
    <div className="flex items-center h-5">
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'peer shrink-0 border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:border-gray-600 dark:bg-gray-800',
          sizeClasses[size],
          error && 'border-destructive',
          className
        )}
        aria-required={required ? true : undefined}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn('flex items-center justify-center text-current')}
        >
          <Check className="h-4 w-4 dark:text-white" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </div>

    {(label || helperText || error) && (
      <div className="ml-3 text-sm">
        {label && (
          <label
            htmlFor={props.id}
          className={cn(
            'font-medium text-foreground dark:text-gray-300',
            props.disabled && 'opacity-50'
          )}
        >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
        {(helperText || error) && (
          <p className={cn(
            'text-sm',
            error ? 'text-destructive' : 'text-muted-foreground dark:text-gray-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )}
  </div>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
