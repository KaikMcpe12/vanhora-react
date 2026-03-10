import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Banknote,
  Calendar,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
  Share2,
  Star,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { ScheduleDialogSkeleton } from './schedule-dialog-skeleton'

export interface ScheduleDialogProps {
  scheduleId: string
  open: boolean
}

const ALL_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MOCK_SCHEDULE = {
  id: '#121212',
  cooperativeName: 'TopVans',
  cooperativeRating: 4.5,
  cooperativeReviews: 120,
  tripCode: '4415',
  departureTime: '08:00',
  arrivalTime: '11:30',
  duration: '3h 30min',
  origin: 'Nova Russas',
  destination: 'Crateús',
  price: 19.9,
  status: 'upcoming-soon' as const,
  badge: 'available' as const,
  isFavorite: false,
  description:
    'Serviço direto de Nova Russas para Crateús com paradas apenas para embarque e desembarque em pontos específicos. Veículos climatizados e com wi-fi.',
  cities: ['Nova Russas', 'Sucesso', 'Crateús'],
  operatingDays: ['Ter', 'Qua', 'Qui'],
  contact: {
    phone: '(85) 3222-3333',
    email: 'contato@cooptransregional.com.br',
    website: 'www.cooptransregional.com.br',
  },
}

// isso vai para a api
interface ScheduleDetails {
  id: string
  cooperativeName: string
  cooperativeImage?: string
  cooperativeRating?: number
  cooperativeReviews?: number
  tripCode?: string
  departureTime: string
  arrivalTime: string
  duration: string
  origin: string
  destination: string
  price: number
  status: 'upcoming-soon' | 'upcoming' | 'past'
  badge: 'available' | 'cancelled'
  isFavorite?: boolean
  description: string
  cities: string[]
  operatingDays: string[]
  contact: { phone: string; email: string; website: string }
}

export function ScheduleDialog({ scheduleId, open }: ScheduleDialogProps) {
  const [isFav, setIsFav] = useState(false)

  const { data: schedule } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: async (): Promise<ScheduleDetails> => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return MOCK_SCHEDULE
    },
    enabled: open,
  })

  const isPast = schedule?.status === 'past'
  const isCancelled = schedule?.badge === 'cancelled'
  const isDimmed = isPast || isCancelled

  const statusLabel = isCancelled
    ? 'Cancelado'
    : schedule?.status === 'upcoming-soon'
      ? 'Disponível'
      : schedule?.status === 'upcoming'
        ? 'Em breve'
        : 'Encerrado'

  const statusColor = isCancelled
    ? 'bg-red-500 text-white border-transparent'
    : schedule?.status === 'upcoming-soon'
      ? 'bg-white text-emerald-700 border-transparent'
      : schedule?.status === 'upcoming'
        ? 'bg-white text-blue-700 border-transparent'
        : 'bg-white/90 text-gray-600 border-transparent'

  return (
    <DialogContent className="w-full max-w-lg gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-2xl [&>button]:hidden">
      {schedule ? (
        <>          
          <div className="relative h-40 w-full shrink-0 overflow-hidden">
            {schedule.cooperativeImage ? (
              <img
                src={schedule.cooperativeImage}
                alt={schedule.cooperativeName}
                className={cn(
                  'h-full w-full object-cover',
                  isDimmed && 'grayscale',
                )}
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: isDimmed
                    ? 'linear-gradient(135deg, #374151 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #14532d 0%, #16a34a 60%, #4ade80 100%)',
                }}
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 px-5 pb-4">
              <p className="text-2xl font-black tracking-tight text-white drop-shadow-lg">
                {schedule.cooperativeName}
              </p>
              {schedule.cooperativeRating && (
                <div className="mt-1 flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3.5 w-3.5',
                        i < Math.floor(schedule.cooperativeRating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-white/20 text-white/40',
                      )}
                    />
                  ))}
                  <span className="text-xs font-medium text-white/90">
                    {schedule.cooperativeRating}
                  </span>
                  {schedule.cooperativeReviews && (
                    <span className="text-xs text-white/60">
                      ({schedule.cooperativeReviews} avaliações)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setIsFav((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50 active:scale-95"
              >
                <Heart
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isFav
                      ? 'fill-rose-400 text-rose-400'
                      : 'fill-white/20 text-white/70',
                  )}
                />
              </button>
            </div>

            <div className="absolute top-3 left-4">
              <Badge
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  statusColor,
                )}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
          
          <div className="max-h-[70vh] w-full overflow-x-hidden overflow-y-auto">
            {schedule.tripCode && (
              <div className="flex items-center justify-end px-5 pt-3">
                <span className="text-muted-foreground font-mono text-xs">
                  #{schedule.tripCode}
                </span>
              </div>
            )}

            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-4xl leading-none font-black tabular-nums">
                    {schedule.departureTime}
                  </p>
                  <p className="text-muted-foreground mt-1.5 flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {schedule.origin}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <div className="border-muted-foreground/40 h-px w-8 border-t-2 border-dashed" />
                    <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full">
                      <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
                    </div>
                    <div className="border-muted-foreground/40 h-px w-8 border-t-2 border-dashed" />
                  </div>
                  <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                    {schedule.duration}
                  </span>
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <p className="text-foreground text-4xl leading-none font-black tabular-nums">
                    {schedule.arrivalTime}
                  </p>
                  <p className="text-muted-foreground mt-1.5 flex items-center justify-end gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {schedule.destination}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="mx-5 mt-4" />

            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              <InfoTile
                icon={<Clock className="h-4 w-4" />}
                label="Horário de partida"
                value={schedule.departureTime}
                accent
              />
              <InfoTile
                icon={<Banknote className="h-4 w-4" />}
                label="Preço"
                value={
                  isCancelled
                    ? 'Cancelado'
                    : `R$ ${schedule.price.toFixed(2).replace('.', ',')}`
                }
                accent={!isCancelled}
                strikethrough={isCancelled}
              />
            </div>

            <Separator className="mx-5" />

            <div className="px-5 py-4">
              <SectionTitle>Descrição</SectionTitle>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {schedule.description}
              </p>
            </div>

            <Separator className="mx-5" />

            <div className="px-5 py-4">
              <SectionTitle>Cidades contempladas</SectionTitle>
              <div className="mt-3 flex flex-wrap items-center gap-1">
                {schedule.cities.map((city, i) => (
                  <div key={city} className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      {city}
                    </Badge>
                    {i < schedule.cities.length - 1 && (
                      <ChevronRight className="text-muted-foreground/50 h-3.5 w-3.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mx-5" />

            <div className="px-5 py-4">
              <SectionTitle>
                <Calendar className="h-4 w-4" /> Dias de operação
              </SectionTitle>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ALL_DAYS.map((day) => {
                  const active = schedule.operatingDays.includes(day)
                  return (
                    <span
                      key={day}
                      className={cn(
                        'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                        active
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {day}
                    </span>
                  )
                })}
              </div>
            </div>

            <Separator className="mx-5" />

            <div className="px-5 py-4">
              <SectionTitle>Contato</SectionTitle>
              <div className="mt-3 space-y-2.5">
                <ContactRow
                  icon={<Phone className="h-4 w-4" />}
                  href={`tel:${schedule.contact.phone}`}
                  label={schedule.contact.phone}
                />
                <ContactRow
                  icon={<Mail className="h-4 w-4" />}
                  href={`mailto:${schedule.contact.email}`}
                  label={schedule.contact.email}
                />
                <ContactRow
                  icon={<Globe className="h-4 w-4" />}
                  href={`https://${schedule.contact.website}`}
                  label={schedule.contact.website}
                  external
                />
              </div>
            </div>
          </div>
          
          <div className="border-border bg-background border-t px-5 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 rounded-xl font-semibold"
                onClick={() =>
                  navigator.share?.({ title: schedule.cooperativeName })
                }
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </>
      ) : (
        <ScheduleDialogSkeleton />
      )}
    </DialogContent>
  )
}

// helpers

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
      {children}
    </h3>
  )
}

function InfoTile({
  icon,
  label,
  value,
  accent = false,
  strikethrough = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: boolean
  strikethrough?: boolean
}) {
  return (
    <div className="bg-muted/60 rounded-2xl px-4 py-3">
      <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-medium tracking-wide uppercase">
          {label}
        </span>
      </div>
      <p
        className={cn(
          'text-lg font-bold tabular-nums',
          accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
          strikethrough && 'line-through',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ContactRow({
  icon,
  href,
  label,
  external = false,
}: {
  icon: React.ReactNode
  href: string
  label: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
    >
      <span className="text-foreground/60 shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </a>
  )
}
