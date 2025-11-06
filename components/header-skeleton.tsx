import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-3 shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-32 hidden sm:block" />
          </div>

          {/* Search Bar Skeleton - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-l-md" />
            <Skeleton className="h-9 flex-1 rounded-r-md" />
          </div>

          {/* Right Actions Skeleton - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>

          {/* Mobile Menu Button Skeleton */}
          <div className="flex md:hidden">
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}
