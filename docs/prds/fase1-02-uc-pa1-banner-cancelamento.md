# PRD — UC-PA1 — Banner de cancelamento em favoritos (`HomeFeedSection`)

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Fase 1 — Pré-backend
> **Persona:** Público / Passageiro

## 1. Resumo

Hoje o passageiro só descobre que um favorito foi cancelado quando abre `/schedules/favorites`. Este PRD adiciona um banner passivo na `HomeFeedSection` que, de forma discreta, avisa quando ≥1 favorito do dia está cancelado — com dispensa persistida em `localStorage` por 1 dia.

## 2. Problema real + usuário impactado

**Persona:** passageiro público sem cadastro (favoritos armazenados em `localStorage`, limite 100 — ver doc base §4.1).

**Problema:** passageiro favorita horários frequentes (ex: "ida pro trabalho às 6:40"). Se cooperativa cria exceção de cancelamento, a informação só aparece dentro de `/schedules/favorites`. A home passa a mensagem errada ("tudo normal") até o usuário entrar na página de favoritos. O custo real: passageiro vai para o ponto e descobre lá que a van não vem.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.1 "UC-PA1 — Banner de cancelamento em favoritos (`HomeFeedSection`)" (linhas ~363–394).
- **Roadmap:** `../roadmap-execucao.md` §3 Fase 1 item 2 + §3.2 "Critério de pronto".

## 4. User stories

1. **Como** passageiro com favorito "6:40 Juazeiro → Fortaleza", **quero** ser avisado na home quando esse horário for cancelado hoje, **para** não perder tempo indo até o ponto.
2. **Como** passageiro com 5 favoritos e 2 cancelados hoje, **quero** uma mensagem que adapte o plural ("2 dos seus favoritos hoje estão cancelados"), **para** entender rapidamente a dimensão do problema.
3. **Como** passageiro que já viu o aviso de hoje, **quero** dispensar o banner com um `X`, **para** ele não voltar na próxima vez que eu abrir a home.
4. **Como** passageiro no dia seguinte, **quero** que o banner reapareça se ainda houver favoritos cancelados, **para** não confiar numa dispensa de ontem.
5. **Como** passageiro clicando no banner, **quero** ir direto para `/schedules/favorites` já com filtro de cancelados aplicado, **para** não precisar filtrar manualmente.
6. **Como** passageiro em rede fraca, **quero** que o banner não quebre a home se a API falhar, **para** continuar vendo meus favoritos mesmo offline-ish.

## 5. Requisitos funcionais

- **RF1** — Banner renderiza no topo da `HomeFeedSection`, antes dos favoritos listados.
- **RF2** — Banner aparece **só se** houver ≥1 favorito com `badge: "cancelled"` para a data **hoje**.
- **RF3** — Mensagem adapta ao número:
  - 1 → "1 dos seus favoritos hoje está cancelado"
  - N (≥2) → "N dos seus favoritos hoje estão cancelados"
- **RF4** — Cor do banner: amarelo suave (`warning`), não vermelho. Ícone `AlertCircle` da Lucide. Usar `StatusChip` existente com tone `warning` (convenção §9.1 doc base).
- **RF5** — Clique no banner leva para `/schedules/favorites?status=cancelled` (filtro pré-aplicado).
- **RF6** — Banner dispensável via `X`. Dispensa persiste em `localStorage.vanhora_cancelled_banner_dismissed = <today ISO>`.
- **RF7** — No próximo carregamento, verificar `localStorage.vanhora_cancelled_banner_dismissed === today` — se sim, esconder banner mesmo que condição permaneça.
- **RF8** — Dia novo (data mudou) → `localStorage` fica stale, condição é reavaliada, banner reaparece se condição continuar.
- **RF9** — Zero favoritos → não chamar endpoint, não mostrar banner.
- **RF10** — API falhando → banner silencioso (apenas `console.error`, sem toast ou retry visível).
- **RF11** — Chamada à API usa `GET /api/schedules?ids=<favorites>&date=<today>`; filtra client-side `badge === "cancelled"` e conta.

## 6. Requisitos não-funcionais

- **Performance:** cache React Query com `staleTime: 5min` — não refetch a cada visita à home.
- **Acessibilidade:**
  - Botão `X` ≥44×44px.
  - Banner tem `role="status"` + `aria-live="polite"` (não interrompe leitor de tela).
  - Clique no corpo do banner é link navegável (não div com onClick).
  - Mensagem comunica status via cor + ícone + texto (convenção §1.2 doc base).
- **Mobile-first:** banner ocupa `w-full`, texto em 1 linha truncável.
- **Rede fraca:** zero banner → zero chamada de rede. Com favoritos: 1 chamada única cacheada 5min.
- **i18n:** mensagens em pt-BR puro, sem placeholder para outros idiomas (produto é regional).

## 7. Fluxo UX detalhado

1. Passageiro abre home.
2. `HomeFeedSection` monta; lê favoritos do `localStorage`.
3. Se `favorites.length === 0`: não renderiza banner. Fim.
4. Se `favorites.length > 0`: chama `GET /api/schedules?ids=<ids>&date=<today>`.
5. Response recebido:
   - Filtrar `badge === "cancelled"`.
   - Contar: `cancelledCount`.
6. Verificar `localStorage.vanhora_cancelled_banner_dismissed`:
   - Igual a `<today ISO>` → esconder banner.
   - Diferente ou ausente → renderizar banner (se `cancelledCount > 0`).
7. Banner renderizado:
   - Tom `warning` (amarelo suave) via `StatusChip`.
   - Ícone `AlertCircle` à esquerda.
   - Mensagem com plural adaptado.
   - Botão `X` à direita.
8. Clique no corpo do banner (link): `navigate("/schedules/favorites?status=cancelled")`.
9. Clique no `X`:
   - Grava `localStorage.vanhora_cancelled_banner_dismissed = <today ISO>`.
   - Remove banner do DOM (sem animação pesada; `transition-opacity` ok).
10. Edge case — favorito aponta para schedule que não existe mais: backend retorna `badge: "unknown"` ou omite. **Não contar como cancelado.**
11. Edge case — API falha (5xx ou timeout): não mostrar banner. Apenas `console.error` com contexto.
12. Edge case — relógio do cliente adiantado em 1 dia: `today` do cliente ≠ `today` do servidor. Aceito (favorece dispensa agressiva, não falso positivo).

## 8. Mudanças de API/schema

**Nenhuma mudança de schema.** Nenhum endpoint novo.

`GET /api/schedules?ids=<ids>&date=<today>` já existe no contrato (`api-spec.md §2.1`) e já retorna `badge` baseado em `schedules_exceptions`. Mock da Fase 1 precisa suportar esse filtro — na prática, consultar `localStorage` + materializar o response com badge adequado é parte da entrega.

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: passageiro com 2 favoritos, 1 cancelado hoje, banner aparece**
```
Dado que o passageiro tem 2 favoritos no localStorage (schedule A e B)
  E hoje B foi cancelado via exceção
  E localStorage.vanhora_cancelled_banner_dismissed está ausente ou != hoje
Quando o passageiro abre a home
Então o banner renderiza no topo da HomeFeedSection
  E a mensagem é "1 dos seus favoritos hoje está cancelado"
  E o ícone é AlertCircle em tom warning
```

**Cenário 2 — Edge case: dispensa persistente até virar o dia**
```
Dado que o banner está visível para o passageiro
Quando ele clica no X
Então localStorage.vanhora_cancelled_banner_dismissed = <today ISO>
  E o banner some do DOM
Quando o passageiro recarrega a home
Então o banner NÃO renderiza (mesmo com condição intacta)
Quando o passageiro volta no dia seguinte com os mesmos favoritos cancelados
Então o banner RENDERIZA novamente (localStorage ficou stale)
```

**Cenário 3 — Erro: API falhando não quebra a home**
```
Dado que o passageiro tem 3 favoritos
  E GET /api/schedules retorna 500
Quando o passageiro abre a home
Então o banner NÃO renderiza
  E a HomeFeedSection renderiza o restante normalmente
  E console.error registra o erro com contexto
  E nenhum toast de erro é mostrado ao passageiro
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.1 UC-PA1 "Escopo Negativo":

- **NÃO** usar notificação push — passageiro não tem cadastro.
- **NÃO** adicionar som/vibrar ao renderizar o banner.
- **NÃO** mostrar banner para badges "atrasado" ou "suspenso" — só `cancelled`.
- **NÃO** criar entidade `favorites` no backend (continua `localStorage`, limite 100).
- **NÃO** persistir dispensa além do dia (amanhã reaparece se condição persistir).

Reforço de regras globais §6.3:
- Sem canal externo (WhatsApp/email). Comunicação dentro do site.
- Sem notificação push.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.1 Fase 1:
- **Nenhuma dependência interna** com UC-P4+PA2 ou Higiene mock (podem rodar paralelos).
- **Nenhuma dependência de backend** — vive sobre mocks + `localStorage`.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- **R11 (técnico, baixo):** contrato do backend muda durante Fase 1. Mitigação: mock já implementa o shape esperado; endpoint `GET /api/schedules?ids=...` está em `api-spec.md §2.1`.
- Nenhum risco de produto específico aplicável.

## Perguntas residuais

Nenhuma.
