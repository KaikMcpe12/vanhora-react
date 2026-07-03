import type { LucideIcon } from 'lucide-react'
import { Clock, PartyPopper, Search } from 'lucide-react'

const HOW_IT_WORKS_STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Search,
    title: 'Busque sua rota',
    description: 'Selecione sua origem, destino e a data em que pretende viajar.',
  },
  {
    icon: Clock,
    title: 'Veja os horários',
    description: 'Confira em tempo real todas as opções disponíveis das cooperativas.',
  },
  {
    icon: PartyPopper,
    title: 'Escolha e viaje',
    description: 'Vá até o terminal, embarque na sua topique e aproveite o percurso.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-muted/20 mx-auto max-w-7xl rounded-2xl px-6 py-14 text-center">
      <h2 className="text-foreground mb-3 text-2xl font-bold">Como funciona o VanHora?</h2>
      <p className="text-muted-foreground mb-10 text-sm">
        Sua viagem planejada em apenas 3 passos simples.
      </p>

      <div className="grid gap-10 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-vh-amber-bg text-vh-amber-text">
                <Icon className="h-9 w-9" strokeWidth={1.75} />
              </div>
              <h3 className="text-foreground mb-3 text-base font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
