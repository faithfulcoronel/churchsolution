// src/components/ui2/skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

function Skeleton({ as: Component = 'div', className, ...props }: SkeletonProps) {
  return (
    <Component
      className={cn('animate-pulse rounded-md bg-muted dark:bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
