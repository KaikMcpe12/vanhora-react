import type { CooperativeOperatingStats } from '@/lib/data/mock-cooperative-details'

const WEEKDAYS_PT: Record<string, string> = {
  monday: 'segunda', tuesday: 'terça', wednesday: 'quarta',
  thursday: 'quinta', friday: 'sexta', saturday: 'sábado', sunday: 'domingo',
}

type StatCardProps = { value: string; label: string }

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-[12px] border border-border/50 bg-card p-[16px_18px]">
      <p className="text-[24px] font-medium leading-none text-foreground">{value}</p>
      <p className="mt-2 text-[12px] text-muted-foreground">{label}</p>
    </div>
  )
}

type CooperativeStatsProps = {
  stats: CooperativeOperatingStats
}

export function CooperativeStats({ stats }: CooperativeStatsProps) {
  const weeklyTotal = Object.values(stats.schedulesPerWeekday).reduce((s, n) => s + n, 0)
  const busiestDayPt = WEEKDAYS_PT[stats.busiestDay] ?? stats.busiestDay

  return (
    <div>
      <h2 className="mb-4 text-[18px] font-medium text-foreground">Operação</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          value={String(weeklyTotal)}
          label="saídas por semana"
        />
        <StatCard
          value={busiestDayPt.charAt(0).toUpperCase() + busiestDayPt.slice(1)}
          label="é o dia com mais saídas"
        />
        <StatCard
          value={`R$ ${stats.avgPrice.toFixed(0)}`}
          label="preço médio"
        />
        <StatCard
          value={stats.topDestination.cityName}
          label={`é o destino mais popular (${stats.topDestination.scheduleCount} hoje)`}
        />
      </div>
    </div>
  )
}
