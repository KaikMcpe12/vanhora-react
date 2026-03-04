import { ScheduleFilters } from '@/components/schedule-filter'

import { FavoriteSchedules } from './favorite-schedule'
import { HeroSection } from './hero-section'

export function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />

      <div className="md:grid grid-cols-3 wrap gap-8 md:px-12 px-6 py-6">
        {/* column 1 */}
        <aside className="col-span-1 flex shrink-0 flex-col gap-4">
          <ScheduleFilters />
          <FavoriteSchedules />
        </aside>

        {/* column 2 */}
        <div className="col-span-2 space-y-8">
          <section className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-foreground text-3xl font-bold">
                Mais seções virão aqui
              </h2>
            </div>
          </section>
          <section className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-foreground text-3xl font-bold">
                Mais seções virão aqui
              </h2>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
