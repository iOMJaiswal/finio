import { cn } from '../../lib/formatters';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg animate-shimmer',
        className
      )}
      style={{
        background: 'linear-gradient(90deg, #111118 0%, #1A1A24 50%, #111118 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-subtle bg-bg-secondary/80 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-16 mb-4" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1.5" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`rounded-2xl border border-subtle bg-bg-secondary/80 p-5 ${height}`}>
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-3 w-24 mb-6" />
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}
