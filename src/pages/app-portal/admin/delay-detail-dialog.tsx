import { RotateCcw } from 'lucide-react'

import { SeverityBadge } from '@/components/delays/severity-badge'
import { StatusChip } from '@/components/status-chip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminDelay } from '@/lib/data/mock-admin-delays'
import { DELAY_STATUS_META } from '@/lib/status/status-meta'
import { formatDelayDateTime } from '@/lib/utils/format'

interface DelayDetailDialogProps {
  delay: AdminDelay | null
  /** controla abertura independente do dado já ter chegado */
  isOpen?: boolean
  /** exibe skeleton enquanto o fetch por id está em andamento */
  isLoadingDelay?: boolean
  onClose: () => void
  /** ações opcionais — quando ausentes o dialog fica somente leitura (ex.: aba cooperativa) */
  onResolve?: (id: string) => void
  onReopen?: (id: string) => void
  isResolving?: boolean
}

function DelayDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={i === 4 || i === 5 ? 'col-span-2' : ''}>
            <Skeleton className="mb-1.5 h-3 w-16" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DelayDetailDialog({
  delay,
  isOpen,
  isLoadingDelay = false,
  onClose,
  onResolve,
  onReopen,
  isResolving = false,
}: DelayDetailDialogProps) {
  // isOpen permite abrir o dialog antes do dado chegar (mostra skeleton)
  const open = isOpen !== undefined ? isOpen : !!delay
  const canAct = Boolean(onResolve && onReopen)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">
            Detalhes do atraso
          </DialogTitle>
        </DialogHeader>

        {isLoadingDelay || !delay ? (
          <DelayDetailSkeleton />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Rota
                </p>
                <p className="text-foreground mt-0.5 text-[13px] font-medium">
                  {delay.routeCode} — {delay.routeName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Cooperativa
                </p>
                <p className="text-foreground mt-0.5 text-[13px]">
                  {delay.cooperativeName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Data e hora
                </p>
                <p className="text-foreground mt-0.5 text-[13px]">
                  {formatDelayDateTime(delay.reportedAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Atraso
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-foreground text-[13px] font-semibold">
                    {delay.delayMinutes} min
                  </span>
                  <SeverityBadge severity={delay.severity} />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Motivo
                </p>
                <p className="text-foreground mt-0.5 text-[13px] leading-relaxed">
                  {delay.reason}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Reportado por
                </p>
                <p className="text-foreground mt-0.5 text-[13px]">
                  {delay.reportedBy}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  Status
                </p>
                <div className="mt-0.5">
                  <StatusChip {...DELAY_STATUS_META[delay.status]} />
                </div>
              </div>
              {delay.resolvedAt && (
                <div className="col-span-2">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Resolvido em
                  </p>
                  <p className="text-foreground mt-0.5 text-[13px]">
                    {formatDelayDateTime(delay.resolvedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {canAct &&
            delay &&
            !isLoadingDelay &&
            (delay.status === 'pending' ? (
              <Button
                onClick={() => onResolve!(delay.id)}
                disabled={isResolving}
              >
                {isResolving ? 'Resolvendo...' : 'Marcar como resolvido'}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => onReopen!(delay.id)}
                disabled={isResolving}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reabrir
              </Button>
            ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
