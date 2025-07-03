import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui2/card';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  subtext?: string;
}

export default function MetricCard({ label, value, icon: Icon, subtext }: MetricCardProps) {
  return (
    <Card
      hoverable
      className="group relative min-w-[240px] h-auto p-5 shadow-md flex flex-col justify-between gap-2"
    >
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      {Icon && (
        <Icon className="absolute top-4 right-4 text-blue-600 dark:text-blue-400 text-xl" />
      )}
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      {subtext && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtext}</p>}
    </Card>
  );
}
