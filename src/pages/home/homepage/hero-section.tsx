import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import estudante from '@/assets/estudante.png'
import van from '@/assets/fundo-coop.png'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <img
        src={van}
        alt="Van escolar"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />

      {/* gradient*/}
      <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/80 to-background/40 lg:from-background/95 lg:via-background/70 lg:to-background/20" />
      <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent lg:from-background/40" />
      
      <img
        src={estudante}
        alt="Estudante"
        className="absolute right-0 bottom-0 z-10 hidden h-full w-auto object-contain lg:block"
        loading="lazy"
        decoding="async"
      />
      
      <div className="relative z-20 flex h-[calc(100vh-80px)] max-w-2xl flex-col justify-center px-4 sm:px-8 lg:px-14">        
        <h1 className="mb-6 max-w-2xl text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
          Seu tempo é valioso, chegue no{' '}
          <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            horário certo
          </span>
        </h1>
        
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-foreground/80 sm:text-base lg:text-lg">
          Consulte facilmente os horários de partida e chegada das vans que
          conectam diferentes macrorregiões.
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            <Link to="/schedules" className="flex items-center gap-2">
              Ver Horários
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
