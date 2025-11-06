import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <div className="flex overflow-hidden border rounded-xl bg-card">
      {/* Image skeleton */}
      <div className="shrink-0 w-40 h-full">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-6 space-y-4">
        {/* Title */}
        <Skeleton className="h-7 w-3/4" />

        {/* Date and location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
