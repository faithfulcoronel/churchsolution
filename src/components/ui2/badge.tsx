// src/components/ui2/badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { BaseProps } from './types';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground dark:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground dark:bg-secondary/90',
        destructive: 'border-transparent bg-destructive text-destructive-foreground dark:bg-destructive/90',
        outline: 'text-foreground dark:border-border dark:text-muted-foreground',
        success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-100',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-100',
        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-100'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

interface BadgeProps extends BaseProps, VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {icon && <span className="mr-1 -ml-1">{icon}</span>}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
