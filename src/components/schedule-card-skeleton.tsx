import { Skeleton } from '@/components/ui/skeleton'

export function ScheduleCardSkeleton() {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      {/* Header Image Skeleton */}
      <div className="relative h-32 overflow-hidden">
        <Skeleton className="h-full w-full" />

        {/* Cooperative Name Skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-8 w-32 bg-white/20" />
        </div>

        {/* Bottom Info Skeleton */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-2.5">
          <Skeleton className="h-4 w-24 bg-white/20" />
          <div className="mt-1 flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded-full bg-white/20" />
            <Skeleton className="h-3 w-16 bg-white/20" />
          </div>
        </div>

        {/* Favorite Star Skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="px-4 pt-3.5 pb-0">
        {/* Status Badge and Trip Code Skeleton */}
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Time and Route Skeleton */}
        <div className="mb-1 flex items-start gap-3">
          {/* Departure */}
          <div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>

          {/* Duration */}
          <div className="mt-3 flex flex-1 items-center gap-1.5">
            <div className="border-border h-px flex-1 border-t border-dashed" />
            <Skeleton className="h-3 w-10" />
            <div className="border-border h-px flex-1 border-t border-dashed" />
            <Skeleton className="h-3.5 w-3.5 rounded-sm" />
          </div>

          {/* Arrival */}
          <div className="text-right">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-1 h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Price and Button Skeleton */}
      <div className="border-border mx-4 mt-3.5 flex items-center justify-between border-t py-3">
        <div>
          <Skeleton className="mb-1 h-3 w-8" />
          <Skeleton className="h-6 w-16" />
        </div>

        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  )
}

export function ScheduleCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ScheduleCardSkeleton key={i} />
      ))}
    </div>
  )
}
