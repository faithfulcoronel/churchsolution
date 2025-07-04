import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Skeleton } from '../ui2/skeleton';

export function MetricCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-5 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  );
}
