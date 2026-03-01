import { House } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()
  const [displayNumber, setDisplayNumber] = useState('0')

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      if (current < 4) {
        setDisplayNumber(String(current).padStart(3, '0'))
        current++
      } else {
        setDisplayNumber('404')
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8">      
      <div className="absolute inset-0">
        <div className="from-primary/20 to-primary/10 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-r blur-3xl" />
        <div className="from-primary/10 absolute -top-32 -right-32 h-64 w-64 rounded-full bg-linear-to-b to-transparent blur-2xl" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center">        
        <div className="text-muted animate-fade-in mb-4 text-center text-9xl font-black">
          {displayNumber}
        </div>
        
        <div className="via-primary animate-slide-in mb-8 h-1 w-48 bg-linear-to-r from-transparent to-transparent" />
        
        <div className="animate-slide-in mb-8 text-center [animation-delay:0.2s]">
          <h1 className="text-foreground mb-4 text-4xl font-bold">
            Fim da linha!
          </h1>
          <p className="text-muted-foreground text-lg">
            Essa página não faz parte do nosso trajeto.
          </p>
        </div>
        
        <div className="animate-slide-in flex flex-col gap-4 [animation-delay:0.4s] sm:flex-row">
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/50 flex items-center justify-center gap-2 rounded-lg px-8 py-3 font-semibold transition-all hover:shadow-lg"
          >
            <span className="text-xl">
              <House />
            </span>
            Voltar para o Início
          </button>
          <button
            onClick={() => navigate(-1)}
            className="border-border text-foreground hover:border-primary hover:bg-accent rounded-lg border px-8 py-3 font-semibold transition-all"
          >
            Retomar trajeto anterior
          </button>
        </div>
      </div>
    </div>
  )
}
