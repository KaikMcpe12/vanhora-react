import { Code2, Github, Heart, Linkedin, Wrench } from 'lucide-react'
import { useState } from 'react'

import { StubLink } from '@/components/ui/stub-link'

const TECHNOLOGIES = [
  {
    name: 'React + TypeScript',
    desc: 'Interface reativa e tipada, com Vite pro dev experience.',
  },
  {
    name: 'TailwindCSS + shadcn/ui',
    desc: 'Sistema de design consistente sem CSS custom excessivo.',
  },
  {
    name: 'TanStack Query',
    desc: 'Cache e sincronização de dados assíncronos.',
  },
  {
    name: 'Node.js + Fastify',
    desc: 'API leve com PostgreSQL como banco.',
  },
  {
    name: 'JWT + Better Auth',
    desc: 'Autenticação do painel administrativo (planejado).',
  },
]

const iconWrap =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-vh-amber-bg text-vh-amber-text'

const socialPill =
  'inline-flex items-center gap-1.5 rounded-full border border-border/70 px-[10px] py-[5px] text-[12px] text-foreground transition-colors hover:border-primary hover:text-primary'

export function Author() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="min-h-screen">
      {/* hero */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">
            Quem fez isso?
          </p>
          <h1 className="text-foreground text-4xl leading-tight font-black tracking-tight md:text-5xl">
            O <span className="text-primary">Autor</span>
          </h1>

          {/* cartão do autor */}
          <div className="mt-10 rounded-[14px] border border-border/50 bg-card p-[24px_28px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {imgError ? (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border/50 bg-vh-amber-bg text-[18px] font-medium text-vh-amber-text">
                  FK
                </div>
              ) : (
                <img
                  src="https://github.com/KaikMcpe12.png"
                  alt="Francisco Kaik"
                  className="h-16 w-16 shrink-0 rounded-full border border-border/50 object-cover"
                  onError={() => setImgError(true)}
                />
              )}
              <div>
                <p className="text-[18px] font-medium text-foreground">Francisco Kaik</p>
                <p className="text-[13px] text-muted-foreground">Desenvolvedor web</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href="https://github.com/KaikMcpe12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={socialPill}
                  >
                    <Github size={14} />
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/kaik-oliveira-paiva/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={socialPill}
                  >
                    <Linkedin size={14} />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* conteúdo */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="space-y-16">
          {/* Por que criei */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Heart size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Por que criei o VanHora</h2>
            </div>
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              <p>
                Sou de uma cidade do interior do Ceará onde tópiques e vans intermunicipais são a principal
                forma de locomoção entre cidades vizinhas. Vi minha família perder viagens, esperar por horas
                em terminais sem informação, e depender de grupos de WhatsApp confusos pra descobrir se o
                próximo horário ia sair.
              </p>
              <p>
                O VanHora nasceu como um projeto pessoal pra resolver isso primeiro pra mim, depois pra quem
                precisa. Não é um app de reservas — é um agregador de informação. Porque muitas vezes o
                problema não é falta de transporte, é falta de clareza sobre o que existe.
              </p>
            </div>
          </section>

          <div className="border-t border-border/50" />

          {/* Como foi construído */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Wrench size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Como foi construído</h2>
            </div>
            <div className="space-y-3">
              {TECHNOLOGIES.map((tech) => (
                <div
                  key={tech.name}
                  className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <span className="inline-flex items-center whitespace-nowrap rounded-[8px] bg-vh-amber-bg px-[9px] py-[3px] font-mono text-[12px] font-medium text-vh-amber-text">
                    {tech.name}
                  </span>
                  <span className="text-[13px] text-muted-foreground">{tech.desc}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-border/50" />

          {/* Contribua */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Code2 size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Contribua</h2>
            </div>
            <div className="text-sm leading-relaxed">
              <p className="text-muted-foreground">
                O VanHora é um projeto pessoal open source. Se você é dev, encontrou um bug, tem uma
                sugestão ou quer contribuir com código, o repositório está aberto no GitHub. Se você é
                passageiro e usa o app, feedback também ajuda muito.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://github.com/KaikMcpe12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Github size={14} />
                  Ver no GitHub →
                </a>
                <StubLink className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-4 py-2 text-[13px] font-medium text-foreground">
                  Reportar problema →
                </StubLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
