import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function FinalCtaSection() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto mb-24 max-w-7xl px-6">
      <div className="shadow-primary/20 relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-emerald-600 to-blue-700 p-12 text-center shadow-2xl md:p-20">
        <div className="absolute top-0 right-0 -mt-48 -mr-48 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="bg-primary/20 absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h2 className="mb-6 text-3xl font-black text-white md:text-5xl">
            Pronto para encontrar seu topique?
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">
            Milhares de passageiros usam o VanHora todos os dias para planejar
            suas viagens intermunicipais pelo Ceará.
          </p>

          <Button
            onClick={() => navigate('/schedules')}
            size="lg"
            className="group mx-auto flex items-center gap-3 rounded-2xl bg-white px-10 py-5 font-black text-emerald-700 shadow-xl shadow-black/10 transition-all hover:scale-105 hover:bg-white/95"
          >
            Buscar Horários Agora
            <ArrowRight className="h-5 w-5 font-black transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
