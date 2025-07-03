// src/components/ui2/progress-steps.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    icon: 'h-8 w-8',
    text: 'text-sm',
    line: 'w-0.5',
    connector: 'left-4'
  },
  md: {
    icon: 'h-10 w-10',
    text: 'text-base',
    line: 'w-0.5',
    connector: 'left-5'
  },
  lg: {
    icon: 'h-12 w-12',
    text: 'text-lg',
    line: 'w-0.5',
    connector: 'left-6'
  }
};

function ProgressSteps({
  steps,
  currentStep,
  className,
  orientation = 'vertical',
  size = 'md'
}: ProgressStepsProps) {
  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'flex justify-between' : 'space-y-8',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className={cn('relative', orientation === 'horizontal' && 'flex-1')}
          >
            {!isLast && (
              <div
                className={cn(
                  'absolute',
                  orientation === 'horizontal'
                    ? 'top-5 left-0 right-0 h-0.5'
                    : `${sizeClasses[size].connector} top-14 bottom-0 ${sizeClasses[size].line}`,
                  isCompleted
                    ? 'bg-primary dark:bg-primary'
                    : 'bg-muted dark:bg-muted'
                )}
              />
            )}

            <div
              className={cn(
                'relative flex',
                orientation === 'horizontal' ? 'flex-col items-center' : 'items-start'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-full transition-all duration-200',
                  sizeClasses[size].icon,
                  isCompleted
                    ? 'bg-primary dark:bg-primary text-white'
                    : isCurrent
                      ? 'bg-primary-light dark:bg-primary-light border-2 border-primary dark:border-primary text-primary dark:text-primary'
                      : 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check
                    className={cn(
                      size === 'sm' && 'h-4 w-4',
                      size === 'md' && 'h-5 w-5',
                      size === 'lg' && 'h-6 w-6'
                    )}
                  />
                ) : step.icon || <span className="font-semibold">{index + 1}</span>}
              </span>
              <div className={cn(orientation === 'horizontal' ? 'mt-4 text-center' : 'ml-4')}>
                <h3
                  className={cn(
                    'font-semibold',
                    sizeClasses[size].text,
                    (isCompleted || isCurrent)
                      ? 'text-foreground dark:text-foreground'
                      : 'text-muted-foreground dark:text-muted-foreground'
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    'mt-1',
                    size === 'sm' ? 'text-xs' : 'text-sm',
                    (isCompleted || isCurrent)
                      ? 'text-muted-foreground dark:text-muted-foreground'
                      : 'text-muted-foreground dark:text-muted-foreground'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ProgressSteps };
