import { AlertTriangle, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type ConfirmTone = 'danger' | 'warning' | 'neutral'

const toneStyles: Record<
  ConfirmTone,
  { header: string; chip: string; box: string; boxHeading: string; boxText: string }
> = {
  danger: {
    header: 'bg-destructive text-white',
    chip: 'bg-white/20 text-white',
    box: 'border-destructive/30 bg-destructive/5',
    boxHeading: 'text-destructive',
    boxText: 'text-destructive/80',
  },
  warning: {
    header: 'bg-amber-500 text-white',
    chip: 'bg-white/20 text-white',
    box: 'border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
    boxHeading: 'text-amber-700 dark:text-amber-300',
    boxText: 'text-amber-800/90 dark:text-amber-200/80',
  },
  neutral: {
    header: '',
    chip: 'bg-muted text-muted-foreground',
    box: 'border-border bg-muted/40',
    boxHeading: 'text-foreground',
    boxText: 'text-muted-foreground',
  },
}

interface AdminConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  /** Accent color for the header band. Defaults from `variant`. Use 'warning' for suspend-like actions. */
  tone?: ConfirmTone
  icon?: LucideIcon
  /** Optional bullet list of consequences shown in a tinted alert box. */
  consequences?: string[]
  consequencesTitle?: string
  requireTypedConfirmation?: {
    expectedText: string
    label: string
  }
  onConfirm: () => void | Promise<void>
}

export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  tone,
  icon: Icon = AlertTriangle,
  consequences,
  consequencesTitle = 'Ação irreversível',
  requireTypedConfirmation,
  onConfirm,
}: AdminConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedTone: ConfirmTone =
    tone ?? (variant === 'danger' ? 'danger' : 'neutral')
  const styles = toneStyles[resolvedTone]
  const hasBand = resolvedTone !== 'neutral'

  const isTypedMatch = requireTypedConfirmation
    ? typedValue === requireTypedConfirmation.expectedText
    : true

  const isConfirmDisabled = isLoading || !isTypedMatch

  async function handleConfirm() {
    setError(null)
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
      setTypedValue('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(value: boolean) {
    if (isLoading) return
    if (!value) {
      setTypedValue('')
      setError(null)
    }
    onOpenChange(value)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        className={cn(
          'gap-0 overflow-hidden p-0 sm:max-w-md',
          // Com faixa colorida no header, remover a borda de 1px do modal
          // elimina a linha clara que aparecia entre o backdrop e a faixa
          // (o shadow-lg do AlertDialogContent segue definindo o edge).
          hasBand && 'border-0',
        )}
      >
        {/* header — colored band for danger/warning, plain for neutral */}
        <div
          className={cn(
            'flex items-center gap-3 px-5 py-4',
            hasBand ? styles.header : 'pb-1',
          )}
        >
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              styles.chip,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <AlertDialogTitle
            className={cn(
              'text-[15px] font-semibold',
              hasBand ? 'text-white' : 'text-foreground',
            )}
          >
            {title}
          </AlertDialogTitle>
        </div>

        {/* body */}
        <div className="space-y-4 px-5 py-4">
          <AlertDialogDescription className="text-[13px] leading-relaxed">
            {description}
          </AlertDialogDescription>

          {consequences && consequences.length > 0 && (
            <div className={cn('rounded-lg border border-l-2 p-3', styles.box)}>
              <div
                className={cn(
                  'flex items-center gap-1.5 text-[13px] font-semibold',
                  styles.boxHeading,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {consequencesTitle}
              </div>
              <ul className={cn('mt-1.5 space-y-1 text-[12px]', styles.boxText)}>
                {consequences.map((c) => (
                  <li key={c} className="flex gap-1.5">
                    <span aria-hidden>•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requireTypedConfirmation && (
            <div className="space-y-2">
              <Label className="text-[12px] text-muted-foreground">
                {requireTypedConfirmation.label}
              </Label>
              <Input
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                placeholder={requireTypedConfirmation.expectedText}
                disabled={isLoading}
                className="text-sm"
              />
            </div>
          )}

          {error && <p className="text-[12px] text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter className="border-t border-border px-5 py-4">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isLoading ? 'Confirmando...' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
