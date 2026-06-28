import { Skeleton } from '@/components/ui/skeleton'

export function ScheduleCardSkeleton() {
  return (
    <div className="bg-card rounded-[14px] border border-border/80 overflow-hidden">
      <div className="px-[18px] pt-4 pb-0 space-y-3">
        {/* linha 1: countdown + heart */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full mt-1" />
        </div>

        {/* linha 2: route line */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-[2px] flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* linha 3: meta */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-[22px] w-[22px] rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      {/* chevron strip */}
      <div className="border-t border-border/50 px-[18px] py-2.5">
        <Skeleton className="mx-auto h-3 w-28" />
      </div>
    </div>
  )
}

export function ScheduleCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ScheduleCardSkeleton key={i} />
      ))}
    </div>
  )
}
