import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui2/card';
import { Skeleton } from '../ui2/skeleton';

interface Props {
  title?: string;
  description?: string;
  height?: number;
}

export function ChartCardSkeleton({ title, description, height = 350 }: Props) {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        {title && (
          <CardTitle>
            <Skeleton as="span" className="block h-6 w-1/3" />
          </CardTitle>
        )}
        {description && (
          <CardDescription>
            <Skeleton as="span" className="block h-4 w-1/2" />
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full rounded-md`} style={{ height }} />
      </CardContent>
    </Card>
  );
}
