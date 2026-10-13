# PRD — UC-P4+PA2 — Tabs "Partindo Agora / Próximos / Decorridos"

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Fase 1 — Pré-backend
> **Persona:** Público / Passageiro
> **Nota de nomenclatura (histórica):** "PA2" é breadcrumb de um UC passageiro-side absorvido para dentro de UC-P4 durante a consolidação pré-v1.0.0. Nenhuma definição standalone de PA2 existe nos docs atuais; toda ocorrência é como bundle. Tratado aqui como **UC unificado**. Instrução do briefing D30 confirma: bundle conta como 1 UC na gestão macro.

## 1. Resumo

Transformar a lista plana de `/schedules` em 3 abas temporais ("Partindo Agora", "Próximos", "Decorridos") para reduzir tempo de absorção visual pelo passageiro leigo em rede 3G/4G instável. Default da aba é derivado do horário atual. Também destrava o filtro `date`/`dayOfWeek` no mock (UC-P3 absorvido por D22) removendo os TODOs em `src/lib/api/mock-schedules-api.ts:71,111`.

## 2. Problema real + usuário impactado

**Persona:** passageiro leigo (público-alvo real: interior do Ceará, celular na rua sob sol forte, rede fraca, sem cadastro — ver doc base §1.3).

**Problema:** hoje `/schedules` renderiza uma lista única com todos os horários do dia. Passageiro precisa escanear visualmente para achar o próximo. Em celular sob sol com rede fraca, cada segundo extra importa. O PRD (`guia_inspiracao_vanhora.md §4.A`) estabelece meta de "<2s para absorver o que importa agora".

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.1 "UC-P4+PA2 — Tabs 'Partindo Agora / Próximos / Decorridos' em `/schedules`" (linhas ~326–360).
- **Doc base — UC-P3 absorvido:** `../vanhora-decisoes-e-casos-de-uso.md` §5.1 "UC-P3" (linhas ~295–322) + D22 em §3.7 (linha ~179).
- **Roadmap:** `../roadmap-execucao.md` §3 "Fase 1 — Pré-backend" item 1 + §3.2 "Critério de pronto" + D22, D30.

## 4. User stories

1. **Como** passageiro no ponto, **quero** abrir `/schedules` e ver imediatamente os horários "Partindo Agora", **para** decidir se corro para a van ou aguardo a próxima.
2. **Como** passageiro planejando viagem para daqui a 2h, **quero** uma aba "Próximos" separada, **para** não confundir com horários já decorridos.
3. **Como** passageiro conferindo "aquela van que saiu agora", **quero** uma aba "Decorridos" com peso visual menor, **para** confirmar o horário sem distração visual.
4. **Como** passageiro navegando com URL compartilhada, **quero** que a aba ativa seja persistida em `?tab=now|next|past`, **para** o link enviado ao amigo abrir no mesmo estado.
5. **Como** passageiro aplicando filtros, **quero** empty state honesto se a aba ativa esvazia, **para** entender rapidamente que preciso trocar de aba ou relaxar o filtro.
6. **Como** passageiro observando um horário que está "quase saindo", **quero** que ele saia automaticamente da aba "Partindo Agora" quando passar da janela, **para** não ser induzido a correr atrás de uma van que já saiu.
7. **Como** desenvolvedor da plataforma, **quero** remover os TODOs do mock (`mock-schedules-api.ts:71,111`) para que o filtro `date`/`dayOfWeek` passe a funcionar, **para** destravar UC-P3 (absorvido por D22) sem gerar PRD separado.

## 5. Requisitos funcionais

- **RF1** — Renderizar 3 abas horizontais em `/schedules` usando `Tabs` do shadcn, `grid-cols-3`.
- **RF2** — Classificação temporal (client-side, sem endpoint novo):
  - **Partindo Agora:** janela `-30min a +60min` do agora.
  - **Próximos:** `>+60min` até fim do dia (23:59).
  - **Decorridos:** `<-30min` (horários passados).
- **RF3** — Default da aba na primeira visita: se há schedules em "Partindo Agora" após filtros, abrir nela; senão, abrir "Próximos".
- **RF4** — Persistência da aba selecionada em `?tab=now|next|past` via `nuqs` (padrão da convenção §9.1 do doc base).
- **RF5** — "Decorridos" tem peso visual menor: `opacity-70`, `text-muted-foreground` no label da aba.
- **RF6** — Re-render com `useInterval` de 60s para re-categorizar schedules que cruzam fronteira de janela de tempo (sem refetch — apenas re-classificação do array já carregado).
- **RF7** — Empty state honesto quando aba ativa fica vazia após filtros: mensagem contextual (ex: "Nenhum horário Partindo Agora para esses filtros") + CTA secundário ("Ver Próximos") que troca de aba (sem alterar filtros).
- **RF8** — Countdown nos cards continua funcionando dentro da aba (não há regressão vs atual).
- **RF9** — Filtro `date` e `dayOfWeek` passa a funcionar no mock (remoção dos TODOs em `src/lib/api/mock-schedules-api.ts:71,111`). Semântica: `date` deriva `day_of_week` e aplica; `dayOfWeek` comma-separated aplica como OR; `date` tem prioridade quando ambos vêm juntos.
- **RF10** — Dia atual termina às 23:59; horários do dia seguinte não aparecem em nenhuma aba.

## 6. Requisitos não-funcionais

- **Performance:** categorização usa `useMemo` sobre o array de schedules. Re-render de 60s é apenas computação local, sem chamada de rede.
- **Acessibilidade:** alvos de toque das abas ≥44×44px (convenção §9.1). Navegação via Tab + Enter/Space em todas as abas. Aria-labels em cada tab trigger.
- **Mobile-first:** `grid-cols-3` funciona a partir de 320px. Labels truncam se necessário (`truncate`); tooltip aria-label full.
- **Rede fraca:** zero chamada nova de rede ao trocar de aba. Dependência zero do backend para a feature (categorização client-side).
- **Cor + ícone + texto em todo status:** aba "Decorridos" tem ícone diferenciado (ex: `Clock` com overlay cinza) + texto `muted` + opacity — não só opacity.

## 7. Fluxo UX detalhado

1. Passageiro entra em `/schedules` sem query string.
2. Hook `useSchedules()` busca horários do dia; retorno aplicado em `useMemo` para categorizar.
3. Default da aba é derivado: se `partingNow.length > 0` → `?tab=now`, senão → `?tab=next`.
4. Aba ativa renderiza seu subset. Outras abas mostram contagem no label (ex: "Partindo Agora (3)").
5. Passageiro troca de aba: `nuqs` atualiza `?tab=` sem recarregar.
6. Passageiro aplica filtro (ex: destino "Fortaleza"): array completo é refiltrado; categorização re-roda; aba ativa pode esvaziar.
7. Se aba ativa vazia após filtro: empty state renderiza com mensagem contextual + CTA "Ver Próximos" (troca `?tab=next` sem mexer no filtro).
8. A cada 60s: `useInterval` dispara re-categorização local (sem refetch); schedule que cruzou janela some/entra automaticamente na aba apropriada.
9. Edge case — meia-noite: horários do dia seguinte não aparecem (dia atual limita a 23:59).
10. Edge case — schedule que já saiu há mais de 30min: some de "Partindo Agora" automaticamente no próximo tick de 60s.

## 8. Mudanças de API/schema

**Nenhuma mudança de schema.** Nenhum endpoint novo.

Backend inicial deve honrar o filtro `date`/`dayOfWeek` em `GET /api/schedules` conforme `api-spec.md §2.1` — obrigação implícita por D22. Mock passa a aplicar o filtro no mesmo PR (destrava UC-P3 absorvido).

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: passageiro às 10:15 vê "Partindo Agora" aberta**
```
Dado que são 10:15 e existem schedules às 10:00, 10:30, 11:00 e 14:00 no dia
Quando o passageiro abre /schedules
Então a aba "Partindo Agora" abre por default
  E mostra os schedules de 10:00 (dentro de -30min) e 10:30 (dentro de +60min)
  E a aba "Próximos" tem contagem (2) para 11:00 e 14:00
  E a aba "Decorridos" tem contagem (0)
  E a URL contém "?tab=now"
```

**Cenário 2 — Edge case: aba esvazia após filtro + CTA empty state**
```
Dado que o passageiro está em "Partindo Agora" com 2 schedules visíveis
Quando aplica o filtro "destino=Fortaleza" e nenhum dos 2 vai para Fortaleza
Então a aba "Partindo Agora" fica vazia
  E renderiza o empty state "Nenhum horário Partindo Agora para esses filtros"
  E oferece o CTA "Ver Próximos"
Quando clica em "Ver Próximos"
Então a URL muda para "?tab=next&destino=Fortaleza"
  E o filtro de destino permanece aplicado
```

**Cenário 3 — Erro / fronteira temporal: schedule cruza janela sem refetch**
```
Dado que são 10:29 e existe schedule às 11:00 na aba "Partindo Agora"
Quando passam 60 segundos (useInterval tick)
Então são 10:30
  E o schedule de 11:00 continua em "Partindo Agora" (dentro de +60min)
Quando passam mais 60 segundos
Então são 10:31
  E o schedule de 11:00 CONTINUA em "Partindo Agora" (10:31 + 60min = 11:31 > 11:00)
  E nenhuma chamada de rede foi disparada (apenas re-categorização local)
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.1 UC-P4+PA2 "Escopo Negativo":

- **NÃO** criar endpoint novo. Categorização é derivada client-side.
- **NÃO** mudar as 3 janelas (`-30min`, `+60min`) sem decisão formal — valores do PRD.
- **NÃO** adicionar 4ª aba "Favoritos" aqui (favoritos têm página própria `/schedules/favorites`).
- **NÃO** adicionar notificação sonora/vibrar quando um horário "entra" em "Partindo Agora".
- **NÃO** implementar refetch automático a cada 60s — apenas re-categorização local (performance em rede fraca).
- **NÃO** implementar logic de "feriado nacional" ao destravar o filtro — exceções manuais via cooperativa (herança UC-P3).

Reforço de regras globais §6.3 do doc base:
- Sem GPS, mapa, ETA real-time, notificação push, upload.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.1 Fase 1:
- **Nenhuma dependência interna** com UC-PA1 ou com a Higiene mock (podem rodar 100% em paralelo).
- **Nenhuma dependência de backend** — feature vive sobre mocks.
- **D22:** absorve UC-P3; o PRD de P3 não existe. Backend inicial carrega a obrigação do filtro `date`/`dayOfWeek` em `GET /api/schedules` como parte da §2.1 do `api-spec.md`.
- **D30:** bundle P4+PA2 é 1 UC na gestão macro. Pode virar 2+ tickets filhos quando `/to-tickets` for executado.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- **R11 (técnico):** se o backend introduzir contrato diferente do mock durante a Fase 1, há retrabalho. Mitigação: zero contrato novo neste PRD; filtro `date`/`dayOfWeek` já está em `api-spec.md §2.1`. Risco baixo.
- Sem riscos específicos aplicáveis em §6.1 (produto/escopo) além dos já cobertos pelas regras globais.

## Perguntas residuais

Nenhuma.
