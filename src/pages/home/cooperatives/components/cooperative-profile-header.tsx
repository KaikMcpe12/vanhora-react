import { Globe, Phone, Star } from 'lucide-react'

import type { CooperativeDetail } from '@/lib/data/mock-cooperative-details'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

type CooperativeProfileHeaderProps = {
  cooperative: CooperativeDetail
}

export function CooperativeProfileHeader({ cooperative }: CooperativeProfileHeaderProps) {
  const { name, brandColor, routeCount, rating, ratingCount, phoneNumber, website } = cooperative

  return (
    <div className="rounded-[14px] border border-border/50 bg-card p-[24px_28px]">
      {/* topo: avatar + info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[18px] font-medium text-white"
          style={{ backgroundColor: brandColor }}
          aria-label={name}
        >
          {getInitials(name)}
        </div>
        <div>
          <h1 className="text-[20px] font-medium text-foreground">{name}</h1>
          <p className="text-[13px] text-muted-foreground">
            {routeCount} {routeCount === 1 ? 'rota ativa' : 'rotas ativas'}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <Star size={12} strokeWidth={1.75} className="fill-vh-amber text-vh-amber" />
            <span className="text-[12px] text-foreground">{rating.toFixed(1)}</span>
            <span className="text-[12px] text-muted-foreground">
              ({ratingCount.toLocaleString('pt-BR')} avaliações)
            </span>
          </div>
        </div>
      </div>

      <div className="my-5 border-t border-border/50" />

      <div className="space-y-4">
        {(phoneNumber || website) && (
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
              Contato
            </span>
            <div className="mt-1 space-y-1.5">
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center gap-2 text-[14px] text-primary hover:underline"
                >
                  <Phone size={14} strokeWidth={1.75} className="shrink-0" />
                  {phoneNumber}
                </a>
              )}
              {website && (
                <a
                  href={`https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[14px] text-primary hover:underline"
                >
                  <Globe size={14} strokeWidth={1.75} className="shrink-0" />
                  {website}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
