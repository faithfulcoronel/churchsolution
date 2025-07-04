import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-secondary dark:bg-muted',
  {
    variants: {
      size: {
        default: 'h-4',
        sm: 'h-2',
        lg: 'h-6'
      },
      variant: {
        default: '[&>div]:bg-primary dark:[&>div]:bg-primary/90',
        secondary: '[&>div]:bg-secondary dark:[&>div]:bg-secondary/90',
        destructive: '[&>div]:bg-destructive dark:[&>div]:bg-destructive/90',
        success: '[&>div]:bg-green-500 dark:[&>div]:bg-green-600',
        warning: '[&>div]:bg-yellow-500 dark:[&>div]:bg-yellow-600',
        info: '[&>div]:bg-blue-500 dark:[&>div]:bg-blue-600'
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default'
    }
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100,
    showValue = false,
    animated = false,
    striped = false,
    size,
    variant,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ size, variant, className }))}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all duration-300 ease-in-out',
            striped && 'bg-stripes',
            animated && 'animate-progress'
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        >
          {showValue && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };