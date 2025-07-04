import React from 'react';
import { Skeleton } from '../ui2/skeleton';

interface Props {
  rows?: number;
}

export function DataGridSkeleton({ rows = 5 }: Props) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}
