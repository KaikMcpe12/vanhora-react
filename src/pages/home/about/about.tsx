import { Mail, MapPin, Shield, Star, Zap } from 'lucide-react'

const differentials = [
  'Informações atualizadas sobre horários de transporte regional',
  'Visualização clara com categorização de horários (atuais, próximos, passados)',
  'Filtros avançados para encontrar exatamente o que você procura',
  'Sistema de favoritos para salvar horários frequentes',
  'Informações sobre comodidades oferecidas pelos serviços',
  'Avaliações de usuários sobre as cooperativas',
]

export function About() {
  return (
    <div className="bg-background min-h-screen">      
      <div className="border-border relative overflow-hidden border-b">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <p className="mb-3 text-xs font-semibold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
            Sobre a plataforma
          </p>
          <h1 className="text-foreground text-4xl leading-tight font-black tracking-tight md:text-6xl">
            Van<span className="text-emerald-500">Hora</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-base md:text-lg">
            O agregador de horários de transporte regional que conecta você às
            cooperativas e vans da sua região.
          </p>
        </div>
        
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-5 dark:opacity-10">
          <div className="absolute top-8 right-12 h-64 w-64 rounded-full border-40 border-emerald-500" />
          <div className="absolute top-32 right-32 h-32 w-32 rounded-full border-20 border-emerald-500" />
        </div>
      </div>
      
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">        
        <div className="space-y-16">          
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                O que é o VanHora?
              </h2>
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              O <span className="text-foreground font-semibold">VanHora</span> é
              uma plataforma web terceirizada que funciona como um agregador de
              informações sobre horários de transporte público regional
              (topiques/vans), conectando diferentes macrorregiões. O sistema
              não opera os serviços de transporte diretamente, mas reúne e
              organiza dados de diversas empresas e cooperativas para facilitar
              a consulta pelos usuários.
            </div>
          </section>

          <div className="border-border border-t" />
          
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                Como funciona?
              </h2>
            </div>
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              <p>
                Nossa plataforma coleta e organiza informações sobre rotas,
                horários, paradas e cooperativas de transporte, apresentando-as
                de forma clara e acessível. Você pode consultar horários,
                visualizar detalhes sobre as rotas e obter informações de
                contato das empresas para reservas.
              </p>
              <p>
                Como um serviço terceirizado, o VanHora não realiza reservas ou
                vendas de passagens diretamente. Fornecemos todas as informações
                necessárias para que você entre em contato com a empresa
                responsável pelo serviço de seu interesse.
              </p>
            </div>
          </section>

          <div className="border-border border-t" />
          
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                Nossos diferenciais
              </h2>
            </div>
            <ul className="space-y-3">
              {differentials.map((item, i) => (
                <li
                  key={i}
                  className="text-muted-foreground flex items-start gap-3 text-sm"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="border-border border-t" />
          
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                Importante saber
              </h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
                <p className="text-sm leading-relaxed text-orange-800 dark:text-orange-300">
                  Os preços exibidos na plataforma são indicativos e devem ser
                  confirmados diretamente com as empresas de transporte.
                  Recomendamos entrar em contato com antecedência para verificar
                  disponibilidade, especialmente em feriados ou datas de alta
                  demanda.
                </p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O VanHora não se responsabiliza por alterações de última hora
                nos horários ou cancelamentos realizados pelas empresas de
                transporte. Sempre confirme as informações diretamente com a
                cooperativa antes de planejar sua viagem.
              </p>
            </div>
          </section>

          <div className="border-border border-t" />
          
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                Entre em contato
              </h2>
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              <p className="mb-4">
                Tem dúvidas, sugestões ou gostaria de incluir sua empresa na
                nossa plataforma?
              </p>
              <a
                href="mailto:contato@vanhora.com.br"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                <Mail className="h-4 w-4" />
                contato@vanhora.com.br
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
