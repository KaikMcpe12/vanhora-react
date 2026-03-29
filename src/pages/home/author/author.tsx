import { CheckIcon, Code2, Heart, Target, Wrench } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

const technologies = [
  { name: 'React', description: 'construção da interface' },
  { name: 'Tailwind CSS', description: 'estilização responsiva' },
  { name: 'shadcn/ui', description: 'componentes de interface' },
  { name: 'Express.js', description: 'backend' },
  { name: 'React Query', description: 'gerenciamento de estado e requisições' },
]

export function Author() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-border relative overflow-hidden border-b">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <p className="mb-3 text-xs font-semibold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
            Quem fez isso?
          </p>
          <h1 className="text-foreground text-4xl leading-tight font-black tracking-tight md:text-6xl">
            O <span className="text-emerald-500">Autor</span>
          </h1>

          <div className="mt-10 flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src="https://github.com/KaikMcpe12.png"
                alt="Francisco Kaik"
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-500/30 md:h-24 md:w-24"
              />
              <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                <CheckIcon className="h-4 w-4" />
              </span>
            </div>

            <div>
              <h2 className="text-foreground text-xl font-bold md:text-2xl">
                Francisco Kaik
              </h2>
              <p className="text-muted-foreground mb-3 text-sm">
                Desenvolvedor WEB
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/KaikMcpe12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <FaGithub className="h-3.5 w-3.5" />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/kaik-oliveira-paiva/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border text-muted-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-blue-500/40 hover:text-blue-500"
                >
                  <FaLinkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
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
                <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                A história da VanHora
              </h2>
            </div>
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              <p>
                O VanHora nasceu da necessidade de centralizar informações sobre
                o transporte público regional, que muitas vezes estão dispersas
                e são difíceis de encontrar. Como morador de uma região que
                depende fortemente desse tipo de transporte, sempre enfrentei
                dificuldades para encontrar horários confiáveis e atualizados.
              </p>
              <p>
                Após anos lidando com a frustração de perder horários ou esperar
                por horas por um transporte, decidi criar uma solução que
                pudesse ajudar não apenas a mim, mas a todos que dependem desse
                serviço essencial.
              </p>
            </div>
          </section>

          <div className="border-border border-t" />

          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                Missão e Visão
              </h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                  Missão
                </p>
                <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">
                  Democratizar o acesso à informação sobre transporte público
                  regional, permitindo que pessoas possam planejar suas viagens
                  com mais segurança e confiabilidade.
                </p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nossa visão é ser a referência em informação sobre transporte
                regional, expandindo gradualmente para mais regiões e agregando
                mais funcionalidades que facilitem a vida dos passageiros.
              </p>
            </div>
          </section>

          <div className="border-border border-t" />

          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Wrench className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                Tecnologias utilizadas
              </h2>
            </div>
            <div>
              <p className="text-muted-foreground mb-4 text-sm">
                O VanHora foi desenvolvido utilizando tecnologias modernas de
                desenvolvimento web:
              </p>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="border-border bg-muted/50 flex items-center gap-1.5 rounded-lg border px-3 py-1.5"
                  >
                    <Code2 className="text-muted-foreground h-3 w-3" />
                    <span className="text-foreground text-xs font-semibold">
                      {tech.name}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      — {tech.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-border border-t" />

          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
                <Heart className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-foreground text-lg font-bold">
                Agradecimentos
              </h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Gostaria de agradecer a todas as cooperativas e empresas de
              transporte que colaboraram fornecendo informações para a
              plataforma, bem como aos usuários que contribuem com feedback
              constante para que possamos melhorar continuamente.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
