import { ArrowRight, Calendar, MapPin, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="from-primary/10 to-background relative min-h-[80vh] w-full overflow-hidden bg-linear-to-b md:h-[calc(100vh-4rem)]">      
      <div className="bg-primary/20 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl md:h-96 md:w-96" />

      <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 md:h-full md:px-6 md:py-16 lg:grid-cols-2 lg:gap-12">        
        {/* left */}
        <div className="z-10 space-y-6 md:space-y-8">
          <h1 className="text-foreground text-3xl leading-tight font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Encontre horários de topiques em{' '}
            <span className="text-primary">tempo real</span>
          </h1>

          <p className="text-muted-foreground max-w-lg text-base leading-relaxed md:text-lg">
            Consulte horários atualizados de todas as cooperativas do Ceará.
            Saiba exatamente quando sua van parte.
          </p>
          
          <div className="bg-card border-border rounded-2xl border p-4 shadow-xl md:p-6 lg:p-8">
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">              
              <div className="space-y-2">
                <Label
                  htmlFor="origin"
                  className="text-foreground text-sm font-bold"
                >
                  De onde você sai?
                </Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="origin"
                    disabled
                    placeholder="Fortaleza"
                    className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-xl py-3 pr-4 pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label
                  htmlFor="destination"
                  className="text-foreground text-sm font-bold"
                >
                  Para onde você vai?
                </Label>
                <div className="relative">
                  <Navigation className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="destination"
                    disabled
                    placeholder="Sobral"
                    className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-xl py-3 pr-4 pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6 space-y-2">
              <Label
                htmlFor="date"
                className="text-foreground text-sm font-bold"
              >
                Quando?
              </Label>
              <div className="relative">
                <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="date"
                  type="date"
                  disabled
                  className="bg-muted/50 border-border focus:ring-primary focus:border-primary rounded-xl py-3 pr-4 pl-10"
                />
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/schedules')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 group flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-all"
            >
              Buscar Horários
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
        
        {/* right */}
        <div className="relative hidden lg:block">
          <div className="bg-card border-border relative rotate-2 transform rounded-4xl border p-6 shadow-2xl lg:p-8">            
            <img
              alt="Van moderna em estrada costeira"
              className="mb-6 aspect-video w-full rounded-xl object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj1WNWIhxyDeiYz8f04BvZ3BY3nVXYjRDrq4vMRr6mIcxuSxpOBCbM3_DM4XTMlDL8mFTKYWCsF0Yt7Xr5bl3MLroAjS69Hr7f-5jTRBHoyMoMs8JgPJfWQbo60QyaLl0Dd03_Z9cftMvRuIvDNmg-dFHP8PT6RmdXCXBffKvBnSr1T41NHx0vqAIVwJ3kjeTanGYksyLidcXvN4bCrJJfFouoriT93gvmObQKb2TVMpFZnVbi5VLGDQl0wN1UM3SLoebIN2qBqvs"
              loading="lazy"
              decoding="async"
            />
            
            <div className="space-y-4">     
              {/* talvéz eu retire */}
              {/*<div className="bg-primary/5 border-primary/20 flex items-center gap-4 rounded-xl border p-4">
                <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <Calendar className="text-primary-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-primary text-xs font-bold tracking-wider uppercase">
                    Próxima Partida
                  </p>
                  <p className="text-foreground font-bold">
                    Fortaleza → Sobral (14:30)
                  </p>
                </div>
              </div>*/}
              
              <div className="bg-secondary/20 border-secondary/30 flex items-center gap-4 rounded-xl border p-4">
                <div className="bg-secondary flex h-10 w-10 items-center justify-center rounded-lg">
                  <MapPin className="text-secondary-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-secondary-foreground/80 text-xs font-bold tracking-wider uppercase">
                    Localização Atual
                  </p>
                  <p className="text-foreground font-bold">BR-222, Km 45</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
