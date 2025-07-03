import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  subtext?: string;
}

export default function MetricCard({ label, value, icon: Icon, subtext }: MetricCardProps) {
  return (
    <div className="relative min-w-[240px] h-auto p-5 rounded-xl bg-white shadow-md flex flex-col justify-between gap-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {Icon && (
        <Icon className="absolute top-4 right-4 text-blue-600 text-xl" />
      )}
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {subtext && <p className="mt-1 text-sm text-gray-400">{subtext}</p>}
    </div>
  );
}
