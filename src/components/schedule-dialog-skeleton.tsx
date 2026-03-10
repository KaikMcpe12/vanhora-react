import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export function ScheduleDialogSkeleton() {
  return (
    <>      
      <div className="relative h-40 w-full shrink-0 overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        
        <div className="absolute top-3 left-4">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        <div className="absolute top-3 right-3">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        <div className="absolute bottom-0 left-0 space-y-2 px-5 pb-4">
          <Skeleton className="h-6 w-32 rounded-md" />
          <Skeleton className="h-3.5 w-40 rounded-md" />
        </div>
      </div>
      
      <div className="max-h-[70vh] w-full overflow-x-hidden overflow-y-auto">        
        <div className="flex justify-end px-5 pt-3">
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-10 w-20 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-0.5 w-8" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-0.5 w-8" />
              </div>
              <Skeleton className="h-3 w-14 rounded" />
            </div>

            <div className="min-w-0 flex-1 flex flex-col items-end space-y-2">
              <Skeleton className="h-10 w-20 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
        </div>

        <Separator className="mx-5 mt-4" />
        
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-muted/60 space-y-2 rounded-2xl px-4 py-3">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          ))}
        </div>

        <Separator className="mx-5" />
        
        <div className="space-y-2 px-5 py-4">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-3 w-3/5 rounded" />
        </div>

        <Separator className="mx-5" />
        
        <div className="px-5 py-4">
          <Skeleton className="mb-3 h-4 w-36 rounded" />
          <div className="flex flex-wrap items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <>
                <Skeleton key={`city-${i}`} className="h-7 w-20 rounded-lg" />
                {i < 2 && (
                  <Skeleton key={`arrow-${i}`} className="h-3.5 w-3.5 rounded" />
                )}
              </>
            ))}
          </div>
        </div>

        <Separator className="mx-5" />
        
        <div className="px-5 py-4">
          <Skeleton className="mb-3 h-4 w-32 rounded" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-10 rounded-lg" />
            ))}
          </div>
        </div>

        <Separator className="mx-5" />
        
        <div className="px-5 py-4">
          <Skeleton className="mb-3 h-4 w-16 rounded" />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-border bg-background border-t px-5 py-4">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </>
  )
}
