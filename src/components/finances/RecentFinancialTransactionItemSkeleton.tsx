import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Skeleton } from '../ui2/skeleton';

export function RecentFinancialTransactionItemSkeleton() {
  return (
    <Card size="sm" className="animate-pulse">
      <CardContent className="flex justify-between items-center gap-4 py-3 px-4">
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </CardContent>
    </Card>
  );
}
