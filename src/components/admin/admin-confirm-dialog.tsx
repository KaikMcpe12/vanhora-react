import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
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
  requireTypedConfirmation,
  onConfirm,
}: AdminConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[15px] font-medium">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireTypedConfirmation && (
          <div className="space-y-2 border-t border-border pt-4">
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
            {error && <p className="text-[12px] text-destructive">{error}</p>}
          </div>
        )}

        {!requireTypedConfirmation && error && (
          <p className="text-[12px] text-destructive">{error}</p>
        )}

        <AlertDialogFooter>
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
