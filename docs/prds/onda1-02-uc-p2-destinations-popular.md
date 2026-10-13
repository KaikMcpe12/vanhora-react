# PRD — UC-P2 — `PopularRoutesSection` consome `GET /api/destinations/popular`

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial
> **Persona:** Público / Passageiro
> **Decisões relacionadas:** D21 (entra na Onda 1 — v1.1.0).

## 1. Resumo

Substituir a lista hardcoded de 6 destinos populares na home pela chamada ao endpoint `GET /api/destinations/popular` (`api-spec.md §2.5`). Destinos passam a refletir volume real (schedules do dia ou campo editorial `cities.is_featured`), não decisão editorial estática.

## 2. Problema real + usuário impactado

**Persona:** passageiro público na home, procurando destino popular como atalho de descoberta.

**Problema:** 6 destinos hardcoded no `PopularRoutesSection` descolam da realidade. Com cooperativas ajustando grade semanalmente, destino "popular" muda. Lista estática mente para o usuário.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.1 "UC-P2 — `PopularRoutesSection` consome `GET /api/destinations/popular`" (linhas ~267–292) + Status v1.1.0 por D21.
- **Doc base — D21:** §3.7 (linha ~178).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco P" linha UC-P2.
- **API-spec:** `api-spec.md §2.5` (endpoint referenciado).

## 4. User stories

1. **Como** passageiro na home, **quero** ver 6 destinos realmente populares hoje, **para** descobrir rapidamente opções sem digitar busca.
2. **Como** passageiro consultando no sábado, **quero** destinos refletindo a grade do sábado (não da segunda), **para** não clicar em destino sem schedules no dia.
3. **Como** passageiro consultando data futura via query param, **quero** destinos re-calculados para aquela data, **para** planejamento adiantado.
4. **Como** passageiro em rede fraca, **quero** fallback para lista estática se API falhar, **para** home não ficar quebrada.
5. **Como** passageiro em plataforma com <6 destinos ativos no dia, **quero** ver só os retornados (sem placeholders), **para** não ser enganado por slots fake.
6. **Como** passageiro observando cor institucional da cooperativa principal, **quero** ver `brand_color` no card, **para** reconhecer visualmente a cooperativa (continuidade do PR8).

## 5. Requisitos funcionais

- **RF1** — Chamar `GET /api/destinations/popular?limit=6&date=<today>` via hook novo `usePopularDestinations({ limit, date })`.
- **RF2** — Response inclui `schedule_count`, `price_from` e `primary_cooperative` (`{ name, brand_color }`).
- **RF3** — Ranking vem do backend: top N por `schedule_count` do dia OU campo editorial `cities.is_featured`. Front não re-ordena.
- **RF4** — Default `limit=6`.
- **RF5** — `date` default é "hoje". Se usuário navega para `?date=<outra>`, destinos re-calculam.
- **RF6** — Cidade sem schedules ativos no dia é excluída pelo backend — front não precisa filtrar.
- **RF7** — Loading state: skeleton de 6 cards.
- **RF8** — Error state silencioso: fallback para array hardcoded atual + `console.error`.
- **RF9** — Edge case `destinations.length < 6`: renderizar apenas os retornados (sem placeholder).
- **RF10** — Remoção do array hardcoded em `PopularRoutesSection` no **mesmo PR** (convenção §9.3).
- **RF11** — Cor institucional (`primary_cooperative.brand_color`) aplicada em borda ou chip do card (reuso do padrão PR8).

## 6. Requisitos não-funcionais

- **Performance:** `staleTime` 15min no cliente (lista muda devagar durante o dia). Backend pode cachear 15min no server. Índices em `routes.destination_city_id` e `schedules.route_id` já existem.
- **Acessibilidade:** cards são links navegáveis (não `<div onClick>`). Cada card tem `aria-label` completo ("Juazeiro do Norte, 8 horários, a partir de R$ 18, Cooperativa Sertão Expresso").
- **Mobile-first:** grid responsivo (ex: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`).
- **Rede fraca:** 1 chamada única cacheada 15min; fallback estático se falhar.

## 7. Fluxo UX detalhado

1. Passageiro abre home.
2. Hook `usePopularDestinations({ limit: 6, date: today })` dispara.
3. Loading: 6 cards skeleton.
4. Response 200: renderizar grid com N cards (N ≤ 6).
5. Cada card mostra: nome da cidade, `schedule_count` do dia, `price_from`, `primary_cooperative.name` com `brand_color` no acento.
6. Clique no card leva para `/schedules?destination=<city_id>&date=<date>`.
7. Response 200 com array vazio: seção não renderiza (ou mostra mensagem institucional discreta — manter comportamento atual).
8. Erro: fallback para lista estática + `console.error`.

## 8. Mudanças de API/schema

- **Endpoint:** `GET /api/destinations/popular` (já em `api-spec.md §2.5`; não é novo em §7.3 do doc base — já existente).
- **Response:** `{ destinations: [{ city: { id, name, state }, schedule_count, price_from, primary_cooperative: { id, name, brand_color } }], total }`.
- **Schema:** sem aditivo próprio. `brand_color` entra pela migration §7.1 item 1 (herdada).

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: 6 destinos renderizam com brand_color**
```
Dado que o backend retorna 6 destinations com primary_cooperative preenchido
Quando o passageiro abre a home
Então PopularRoutesSection renderiza 6 cards
  E cada card exibe brand_color da cooperativa primária
  E cada card linka para /schedules?destination=<city_id>&date=<today>
```

**Cenário 2 — Edge case: plataforma nova, 3 destinos**
```
Dado que o backend retorna 3 destinations
Quando o passageiro abre a home
Então PopularRoutesSection renderiza 3 cards (sem placeholders fake)
  E o layout permanece coerente (grid com 3 colunas ou wrap)
```

**Cenário 3 — Erro: fallback silencioso**
```
Dado que o backend retorna 500
Quando o passageiro abre a home
Então PopularRoutesSection renderiza a lista estática antiga (fallback)
  E console.error registra o erro
  E nenhum toast ou retry visível é exibido
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.1 UC-P2 "Escopo Negativo":

- **NÃO** criar algoritmo de ranking "ML/personalizado" — ranking é editorial ou volume agregado.
- **NÃO** adicionar foto da cidade (`photo_url`) neste UC — fica para schema futuro.
- **NÃO** inventar métricas "trending" ou "crescendo" sem dado histórico comparativo real.

Reforço §6.3: sem invenção de métrica, sem IA de recomendação.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2 Bloco P:
- **Depende do backend expor `GET /api/destinations/popular`.**
- **Independente de UC-P1** — podem subir em paralelo após backend disponível.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- Nenhum risco específico aplicável. Risco técnico implícito: atraso do endpoint.

## Perguntas residuais

Nenhuma.
