import type { CooperativeRecentHistory } from '@/lib/data/mock-cooperative-details'

function onTimeColor(rate: number): string {
  if (rate >= 0.85) return 'var(--color-success)'
  if (rate >= 0.70) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function formatDatePt(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(date)
}

type CooperativeRecentActivityProps = {
  history: CooperativeRecentHistory
}

export function CooperativeRecentActivity({ history }: CooperativeRecentActivityProps) {
  const { delays, cancellations, onTimeRate } = history
  const dist = delays.severityDistribution

  return (
    <div>
      <h2 className="mb-4 text-[18px] font-medium text-foreground">Atividade recente</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* pontualidade */}
        <div className="rounded-[14px] border border-border/50 bg-card p-[20px_24px]">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
            Pontualidade (últimos 30 dias)
          </p>
          <p
            className="text-[32px] font-medium leading-none"
            style={{ color: onTimeColor(onTimeRate) }}
          >
            {Math.round(onTimeRate * 100)}%
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">de saídas no horário</p>

          {delays.last30DaysCount > 0 ? (
            <>
              <p className="mt-4 text-[13px] text-foreground">
                {delays.last30DaysCount} atrasos · média de {delays.averageDelayMinutes}min
              </p>
              <p className="mt-2 flex gap-4 text-[12px]">
                <span className="text-muted-foreground">● {dist.low} leves</span>
                <span style={{ color: 'var(--vh-amber-text)' }}>● {dist.medium} médios</span>
                <span style={{ color: 'var(--color-danger)' }}>● {dist.high} graves</span>
              </p>
            </>
          ) : (
            <p className="mt-4 text-[13px] text-muted-foreground">
              Nenhum atraso reportado nos últimos 30 dias.
            </p>
          )}
        </div>

        {/* cancelamentos */}
        <div className="rounded-[14px] border border-border/50 bg-card p-[20px_24px]">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
            Cancelamentos recentes
          </p>

          {cancellations.last30DaysCount === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              Nenhum cancelamento nos últimos 30 dias.
            </p>
          ) : (
            <>
              <p className="mb-3 text-[13px] text-foreground">
                {cancellations.last30DaysCount} cancelamentos nos últimos 30 dias
              </p>
              <div className="flex flex-col gap-3">
                {cancellations.recent.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                    <div>
                      <p className="text-[12px] font-medium text-foreground">
                        {formatDatePt(c.date)} · {c.route}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{c.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
