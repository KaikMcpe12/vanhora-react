import type { LucideIcon } from 'lucide-react'
import { Clock, PartyPopper, Search } from 'lucide-react'

import { cn } from '@/lib/utils'

interface HowItWorksStep {
  icon: LucideIcon
  title: string
  description: string
}

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: Search,
    title: 'Busque sua rota',
    description:
      'Selecione sua origem, destino e a data em que pretende viajar.',
  },
  {
    icon: Clock,
    title: 'Veja os horários',
    description:
      'Confira em tempo real todas as opções disponíveis das cooperativas.',
  },
  {
    icon: PartyPopper,
    title: 'Escolha e viaje',
    description:
      'Vá até o terminal, embarque na sua topique e aproveite o percurso.',
  },
]

interface HowItWorksStepCardProps {
  step: HowItWorksStep
  index: number
  className?: string
  style?: React.CSSProperties
}

function HowItWorksStepCard({
  step,
  className,
  style,
}: HowItWorksStepCardProps) {
  const Icon = step.icon

  return (
    <div
      className={cn(
        'group animate-fade-in flex flex-col items-center',
        className,
      )}
      style={style}
    >
      <div className="bg-primary/5 text-primary shadow-primary/5 group-hover:bg-primary group-hover:text-primary-foreground mb-8 flex h-24 w-24 items-center justify-center rounded-4xl shadow-xl transition-all duration-300">
        <Icon className="h-10 w-10 font-semibold" strokeWidth={2.5} />
      </div>

      <h3 className="text-foreground mb-4 text-xl font-bold">{step.title}</h3>

      <p className="text-muted-foreground text-center leading-relaxed">
        {step.description}
      </p>
    </div>
  )
}

export function HowItWorksSection() {
  return (
    <section className="bg-muted/30 mx-auto max-w-7xl px-6 py-24 text-center">
      <h2 className="text-foreground mb-4 text-4xl font-black">
        Como funciona o VanHora?
      </h2>

      <p className="text-muted-foreground mb-16 text-lg">
        Sua viagem planejada em apenas 3 passos simples.
      </p>

      <div className="relative grid gap-12 md:grid-cols-3">
        {/* Conectores visuais para desktop */}
        <div className="bg-primary/20 absolute top-1/4 left-1/3 hidden h-0.5 w-20 md:block" />
        <div className="bg-primary/20 absolute top-1/4 right-1/3 hidden h-0.5 w-20 md:block" />

        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <HowItWorksStepCard
            key={step.title}
            step={step}
            index={index}
            style={
              {
                animationDelay: `${index * 0.2}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </section>
  )
}
