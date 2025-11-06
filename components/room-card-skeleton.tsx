import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RoomCardSkeleton() {
  return (
    <Card className="overflow-hidden p-1">
      <div className="flex gap-4 p-0 px-2">
        <div className="flex flex-1 flex-col justify-between rounded-lg p-4">
          <div>
            {/* Event name skeleton */}
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            {/* Title skeleton */}
            <Skeleton className="h-6 w-48 mb-2" />
            {/* Description skeleton */}
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Members and actions skeleton */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
