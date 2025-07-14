import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui2/card';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /**
   * Optional CSS classes for the icon element. Allows pages to
   * colorize icons based on context.
   */
  iconClassName?: string;
  subtext?: string;
  /**
   * Optional CSS classes for the sub label element.
   */
  subtextClassName?: string;
  /**
   * Optional CSS classes for the bottom color barline.
   */
  barClassName?: string;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  subtext,
  subtextClassName,
  barClassName,
}: MetricCardProps) {
  return (
    <Card
      hoverable
      className="group relative min-w-[240px] h-auto p-5 shadow-md flex flex-col justify-between gap-2"
    >
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      {Icon && (
        <Icon
          className={cn(
            'absolute top-4 right-4 text-blue-600 dark:text-blue-400 text-xl',
            iconClassName,
          )}
        />
      )}
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      {subtext && (
        <p className={cn('mt-1 text-sm text-gray-500 dark:text-gray-400', subtextClassName)}>
          {subtext}
        </p>
      )}
      {barClassName && (
        <div
          className={cn('absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl', barClassName)}
        />
      )}
    </Card>
  );
}
