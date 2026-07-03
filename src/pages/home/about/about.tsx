import { Globe, Mail, MapPin, Shield, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'

const differentials = [
  'Informações atualizadas sobre horários de transporte regional',
  'Visualização clara com categorização de horários (atuais, próximos, passados)',
  'Filtros avançados para encontrar exatamente o que você procura',
  'Sistema de favoritos para salvar horários frequentes',
  'Informações sobre comodidades oferecidas pelos serviços',
  'Avaliações de usuários sobre as cooperativas',
]

const iconWrap = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-vh-amber-bg text-vh-amber-text'

async function handleContact() {
  const email = 'contato@vanhora.com.br'
  try {
    await navigator.clipboard.writeText(email)
    toast.success('Email copiado!', { description: email })
  } catch {
    // silently fall through
  }
  window.location.href = `mailto:${email}`
}

export function About() {
  return (
    <div className="min-h-screen">
      {/* hero */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">
            Sobre a plataforma
          </p>
          <h1 className="text-foreground text-4xl leading-tight font-black tracking-tight md:text-5xl">
            Van<span className="text-primary">Hora</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed md:text-lg">
            O agregador de horários de transporte regional que conecta você às cooperativas e vans da sua região.
          </p>
        </div>
      </div>

      {/* conteúdo */}
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="space-y-16">
          {/* O que é */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <MapPin size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">O que é o VanHora?</h2>
            </div>
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              <p>
                O <span className="font-semibold text-foreground">VanHora</span> é
                uma plataforma web que funciona como um agregador de informações sobre horários de
                transporte público regional (topiques/vans), conectando diferentes macrorregiões do Ceará.
                O sistema não opera os serviços de transporte diretamente — reúne e organiza dados de
                diversas cooperativas para facilitar a consulta pelos passageiros.
              </p>
              <p>
                Nasceu do problema real de quem usa tópiques diariamente: horários dispersos, grupos de
                WhatsApp confusos, e terminais sem painel de informação. O VanHora resolve isso centralizando
                tudo em um lugar, com atualização em tempo real e interface limpa.
              </p>
            </div>
          </section>

          <div className="border-t border-border/50" />

          {/* Como funciona */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Zap size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Como funciona?</h2>
            </div>
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              <p>
                Nossa plataforma coleta e organiza informações sobre rotas, horários, paradas e cooperativas
                de transporte, apresentando-as de forma clara e acessível. Você pode consultar horários,
                visualizar detalhes sobre as rotas e obter informações de contato das empresas para reservas.
              </p>
              <p>
                Como um serviço terceirizado, o VanHora não realiza reservas ou vendas de passagens diretamente.
                Fornecemos todas as informações necessárias para que você entre em contato com a empresa
                responsável pelo serviço de seu interesse.
              </p>
            </div>
          </section>

          <div className="border-t border-border/50" />

          {/* Diferenciais */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Star size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Nossos diferenciais</h2>
            </div>
            <ul className="space-y-3">
              {differentials.map((item, i) => (
                <li key={i} className="text-muted-foreground flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="border-t border-border/50" />

          {/* Cidades atendidas */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Globe size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Cidades atendidas</h2>
            </div>
            <div className="text-sm leading-relaxed">
              {/* TODO: quando cidades > 15, migrar pra grid de cards */}
              <p className="text-foreground/90 leading-relaxed">
                Hoje o VanHora agrega horários de rotas que operam entre{' '}
                <strong>Fortaleza, Sobral, Juazeiro do Norte, Crato e Iguatu</strong>
                {' '}— expandindo gradualmente conforme novas cooperativas se juntam à plataforma.
              </p>
              <p className="mt-3 text-muted-foreground">
                Se sua cidade não está na lista e você conhece cooperativas que operam nela,{' '}
                <a href="#contato" className="text-primary underline underline-offset-2">
                  entre em contato →
                </a>
              </p>
            </div>
          </section>

          <div className="border-t border-border/50" />

          {/* Importante saber */}
          <section className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Shield size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Importante saber</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-[12px] border border-vh-amber-border bg-vh-amber-bg p-[16px_18px] text-[14px] leading-relaxed text-vh-amber-text">
                Os preços exibidos na plataforma são indicativos e devem ser confirmados diretamente com as
                empresas de transporte. Recomendamos entrar em contato com antecedência para verificar
                disponibilidade, especialmente em feriados ou datas de alta demanda.
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O VanHora não se responsabiliza por alterações de última hora nos horários ou cancelamentos
                realizados pelas empresas de transporte. Sempre confirme as informações diretamente com a
                cooperativa antes de planejar sua viagem.
              </p>
            </div>
          </section>

          <div className="border-t border-border/50" />

          {/* Entre em contato */}
          <section id="contato" className="grid gap-8 md:grid-cols-[1fr_2fr]">
            <div className="flex items-start gap-3">
              <div className={iconWrap}>
                <Mail size={20} strokeWidth={1.75} />
              </div>
              <h2 className="text-foreground text-lg font-bold">Entre em contato</h2>
            </div>
            <div className="text-sm leading-relaxed">
              <p className="text-muted-foreground mb-4">
                Tem dúvidas, sugestões ou gostaria de incluir sua cooperativa na plataforma?
              </p>
              <button
                type="button"
                onClick={handleContact}
                className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius)] bg-[#0F6E56] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0a5a45]"
              >
                <Mail size={15} strokeWidth={1.75} />
                contato@vanhora.com.br
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
