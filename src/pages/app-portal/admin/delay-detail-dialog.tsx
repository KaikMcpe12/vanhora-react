import { RotateCcw } from 'lucide-react'

import { AdminStatusBadge } from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AdminDelay } from '@/lib/data/mock-admin-delays'

function getSeverityBadge(severity: AdminDelay['severity']) {
  if (severity === 'high') return { variant: 'critical' as const, label: 'Alta' }
  if (severity === 'medium')
    return { variant: 'attention' as const, label: 'Média' }
  return { variant: 'info' as const, label: 'Baixa' }
}

interface DelayDetailDialogProps {
  delay: AdminDelay | null
  onClose: () => void
  /** Ações opcionais — quando ausentes, o dialog fica somente leitura (ex.: aba de cooperativa). */
  onResolve?: (id: string) => void
  onReopen?: (id: string) => void
  isResolving?: boolean
}

export function DelayDetailDialog({
  delay,
  onClose,
  onResolve,
  onReopen,
  isResolving = false,
}: DelayDetailDialogProps) {
  if (!delay) return null
  const severityBadge = getSeverityBadge(delay.severity)
  const canAct = Boolean(onResolve && onReopen)

  return (
    <Dialog open={!!delay} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">Detalhes do atraso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Rota
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-foreground">
                {delay.routeCode} — {delay.routeName}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Cooperativa
              </p>
              <p className="mt-0.5 text-[13px] text-foreground">{delay.cooperativeName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Data e hora
              </p>
              <p className="mt-0.5 text-[13px] text-foreground">
                {new Date(delay.reportedAt).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Atraso
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">
                  {delay.delayMinutes} min
                </span>
                <AdminStatusBadge variant={severityBadge.variant} label={severityBadge.label} />
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Motivo
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-foreground">
                {delay.reason}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Reportado por
              </p>
              <p className="mt-0.5 text-[13px] text-foreground">{delay.reportedBy}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <div className="mt-0.5">
                <AdminStatusBadge
                  variant={delay.status === 'resolved' ? 'success' : 'attention'}
                  label={delay.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                  size="md"
                />
              </div>
            </div>
            {delay.resolvedAt && (
              <div className="col-span-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Resolvido em
                </p>
                <p className="mt-0.5 text-[13px] text-foreground">
                  {new Date(delay.resolvedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {canAct &&
            (delay.status === 'pending' ? (
              <Button onClick={() => onResolve!(delay.id)} disabled={isResolving}>
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
