import {
  CheckCircle2,
  Frown,
  Meh,
  Smile,
  Sparkles,
  ThumbsUp,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useRating } from '@/hooks/use-rating'
import { cn } from '@/lib/utils'

import { RatingStars } from './rating-stars'

interface RatingSectionProps {
  scheduleId: string
  className?: string
}

const FEEDBACK_CONFIG: Record<
  number,
  { icon: React.ReactNode; label: string; color: string }
> = {
  5: {
    icon: <Sparkles className="h-4 w-4" />,
    label: 'Excelente!',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  4: {
    icon: <Smile className="h-4 w-4" />,
    label: 'Muito bom!',
    color: 'text-blue-600 dark:text-blue-400',
  },
  3: {
    icon: <ThumbsUp className="h-4 w-4" />,
    label: 'Bom',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  2: {
    icon: <Meh className="h-4 w-4" />,
    label: 'Regular',
    color: 'text-orange-600 dark:text-orange-400',
  },
  1: {
    icon: <Frown className="h-4 w-4" />,
    label: 'Ruim',
    color: 'text-red-600 dark:text-red-400',
  },
}

export function RatingSection({ scheduleId, className }: RatingSectionProps) {
  const [selectedStars, setSelectedStars] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const { hasRated, currentRating, isLoading, submitRating, isSubmitting } =
    useRating({
      scheduleId,
      onSuccess: () => {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      },
    })

  // Estado: Carregando
  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-3', className)}>
        <div className="bg-muted h-6 w-48 rounded" />
        <div className="bg-muted h-10 w-full rounded" />
      </div>
    )
  }

  // Estado: Sucesso recente
  if (showSuccess) {
    return (
      <div className={cn('animate-fade-in space-y-3', className)}>
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/50 bg-emerald-50 p-4 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Obrigado pela avaliação!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Sua opinião ajuda outros viajantes
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Estado: Já avaliou (permitir editar)
  if (hasRated && currentRating) {
    return (
      <div className={cn('animate-fade-in space-y-3', className)}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold">
            Você já avaliou esta cooperativa
          </h3>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-muted-foreground mb-2 text-xs">Sua avaliação:</p>
          <RatingStars
            value={currentRating.stars}
            onChange={(newStars) => submitRating(newStars)}
            size="lg"
            disabled={isSubmitting}
          />
          <p className="text-muted-foreground mt-2 text-xs">
            Clique para alterar
          </p>
        </div>
      </div>
    )
  }

  // Estado: Formulário de avaliação
  return (
    <div className={cn('animate-fade-in space-y-4', className)}>
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-foreground text-sm font-semibold">
          Avalie esta cooperativa
        </h3>
        <p className="text-muted-foreground text-xs">
          Sua opinião ajuda outros viajantes a escolherem melhor
        </p>
      </div>

      {/* Estrelas */}
      <div className="bg-muted/30 flex flex-col items-center gap-3 rounded-2xl p-6">
        <RatingStars
          value={selectedStars}
          onChange={setSelectedStars}
          size="lg"
          disabled={isSubmitting}
        />

        {selectedStars > 0 && (
          <div
            className={cn(
              'animate-fade-in flex items-center gap-2 text-xs font-medium',
              FEEDBACK_CONFIG[selectedStars].color,
            )}
          >
            {FEEDBACK_CONFIG[selectedStars].icon}
            <span>{FEEDBACK_CONFIG[selectedStars].label}</span>
          </div>
        )}
      </div>

      {/* Botão */}
      <Button
        onClick={() => submitRating(selectedStars)}
        disabled={selectedStars === 0 || isSubmitting}
        className="w-full rounded-xl font-semibold"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Enviando...
          </>
        ) : (
          'Enviar Avaliação'
        )}
      </Button>
    </div>
  )
}
