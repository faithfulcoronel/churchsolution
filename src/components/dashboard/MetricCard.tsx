import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}

export default function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-muted rounded-xl shadow-md p-5 flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 dark:text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-foreground">{value}</p>
      </div>
      {Icon && <Icon className="h-6 w-6 text-gray-400 dark:text-muted-foreground" />}
    </div>
  );
}
