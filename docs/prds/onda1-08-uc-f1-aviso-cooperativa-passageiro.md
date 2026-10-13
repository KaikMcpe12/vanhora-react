# PRD — UC-F1 — Aviso da cooperativa para passageiro público

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco S — contrato aditivo independente)
> **Persona:** Cooperativa (emissor) → Passageiro público (leitor)
> **Decisões relacionadas:** D8 (incluído no escopo).

## 1. Resumo

Cooperativa precisa comunicar passageiros sobre eventos pontuais ("Rota R-204 vai atrasar hoje por manifestação na BR-222"). Hoje impossível. Este UC adiciona 2 campos em `routes` (`announcement_text`, `announcement_expires_at`) para a cooperativa editar + banner compacto no `ScheduleCard` + bloco destacado em `/routes/:id`.

## 2. Problema real + usuário impactado

**Persona:** cooperativa gestora da rota, passageiro público consultando horários.

**Problema:** cooperativa não tem canal integrado para avisar passageiros sobre situações pontuais (bloqueio na estrada, atraso em cadeia, feriado antecipado). WhatsApp é externo (fora de escopo — D6). Hoje passageiro só descobre no ponto.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.1 "UC-F1 — Aviso da cooperativa para passageiro público" (linhas ~397–432).
- **Doc base — D8:** §3.2 (linha ~124).
- **Doc base — Schema:** §7.2 item 16 (linha ~1107).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco S" linha UC-F1.

## 4. User stories

1. **Como** cooperativa com rota afetada por manifestação na BR-222, **quero** publicar aviso "Rota R-204 vai atrasar hoje" com validade até 23:59, **para** passageiros serem informados antes de ir ao ponto.
2. **Como** cooperativa editando um aviso existente, **quero** estender ou encurtar a validade, **para** ajustar conforme a situação muda.
3. **Como** passageiro vendo um `ScheduleCard` da R-204, **quero** banner amarelo compacto com o aviso, **para** não perder a informação.
4. **Como** passageiro abrindo `/routes/:id`, **quero** bloco destacado maior com o aviso, **para** ler o contexto completo.
5. **Como** passageiro com cache antigo após o aviso expirar, **quero** o aviso sumir no próximo refetch, **para** não ser enganado por dado stale.
6. **Como** cooperativa não querendo mais o aviso, **quero** deletar/limpar os campos, **para** o passageiro parar de ver.
7. **Como** admin tentando aviso em nível de cooperativa ("Toda nossa frota em recesso"), **quero** entender que só se aplica por rota, **para** não escapar do escopo.

## 5. Requisitos funcionais

- **RF1** — Adicionar colunas em `routes`:
  - `announcement_text varchar(280) NULL` — limite estilo tweet.
  - `announcement_expires_at timestamp NULL`.
- **RF2** — Validação cross-field: `announcement_expires_at IS NOT NULL` **obrigatório** quando `announcement_text IS NOT NULL`. Backend valida via Zod. Front valida também no form.
- **RF3** — Validação de `announcement_text`: 1–280 chars.
- **RF4** — Validação de `announcement_expires_at`: ISO 8601 **futuro** (não aceita passado).
- **RF5** — Edição via `PUT /api/admin/routes/:id` (aditivo nos campos existentes, não novo endpoint).
- **RF6** — Response de `GET /api/schedules`, `GET /api/routes/:id`, `GET /api/admin/routes` inclui os 2 campos **somente** quando `expires_at > now()`. Backend filtra expiração automaticamente.
- **RF7** — `RouteFormDrawer` (admin + cooperativa) ganha seção colapsável "Aviso aos passageiros":
  - Textarea com contador 0/280.
  - Date-time picker para `expires_at`.
  - Preview do banner como aparecerá no `ScheduleCard`.
- **RF8** — `ScheduleCard` renderiza banner compacto quando `announcement_text` presente:
  - Tom `warning` (amarelo suave) via `StatusChip`.
  - Ícone `Megaphone` ou `Info` (Lucide).
  - Texto truncado em 1 linha com tooltip full.
- **RF9** — `/routes/:id` (página pública da rota) renderiza bloco destacado:
  - Texto completo visível.
  - Validade mostrada ("Válido até DD/MM HH:MM").
- **RF10** — Edge case rota suspensa (`routes.status = 'suspended'`) com aviso: backend **continua** retornando o aviso (contexto útil "rota suspensa hoje por X"). UI do admin pode exibir alerta de que a rota está suspensa mas o aviso continua.

## 6. Requisitos não-funcionais

- **Performance:** index parcial sugerido: `CREATE INDEX idx_routes_announcement ON routes(announcement_expires_at) WHERE announcement_expires_at IS NOT NULL`. Query de limpeza futura (se job existir) usa esse índice.
- **Acessibilidade:** banner comunica via cor + ícone + texto. Clicável para expandir (opcional). Alvo ≥44×44px.
- **Mobile-first:** banner em 1 linha com truncate; tooltip (tap) revela texto completo.
- **Segurança:** texto puro — sem markdown, sem HTML, sem URLs clicáveis automáticas (prevenção XSS §6.3).
- **Rate limit:** usa rate limit implícito do endpoint `PUT /api/admin/routes/:id` existente.

## 7. Fluxo UX detalhado

1. Cooperativa abre `/cooperative/routes` → clica em "Editar" da rota R-204 → `RouteFormDrawer` abre.
2. Expande seção colapsável "Aviso aos passageiros".
3. Digita texto no textarea (contador 0/280 em tempo real).
4. Define `expires_at` via date-time picker (default sugerido: hoje 23:59).
5. Preview do banner renderiza inline.
6. Clica "Salvar" → `PUT /api/admin/routes/:id` com `announcement_text` + `announcement_expires_at`.
7. Backend valida (cross-field, limite 280, futuro). Grava.
8. Passageiro abre `/schedules` → cards da R-204 renderizam banner amarelo compacto.
9. Passageiro abre `/routes/R-204` → bloco destacado maior.
10. Aviso expira automaticamente: backend filtra na próxima query. Front refetch limpa.
11. Edge case — cooperativa limpa textarea e salva: backend grava `NULL` nos 2 campos. Banner some.
12. Edge case — cooperativa tenta salvar texto sem expiração: Zod rejeita cross-field (422).
13. Edge case — admin tenta aviso em nível de cooperativa: não há UI para isso (feature é por rota). Escopo negativo documentado.

## 8. Mudanças de API/schema

- **Schema (§7.2 item 16 doc base):** 2 colunas aditivas em `routes`:
  - `routes.announcement_text varchar(280) NULL`
  - `routes.announcement_expires_at timestamp NULL`
- **Endpoints:** aditivo em `PUT /api/admin/routes/:id` (aceita os 2 campos). Response de `GET /api/schedules`, `GET /api/routes/:id`, `GET /api/admin/routes` inclui os 2 campos (§7.3 item 13 do doc base).
- **Nenhum endpoint novo.**

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: cooperativa publica aviso + passageiro vê**
```
Dado que a cooperativa Alpha é dona da rota R-204
  E são 10:00 do dia 20/10
Quando a cooperativa salva texto "Rota R-204 atrasa hoje por manifestação" com expires_at = 2026-10-20T23:59:00
Então o backend grava os 2 campos
  E GET /api/schedules para R-204 inclui o aviso
  E o ScheduleCard do passageiro renderiza banner amarelo com o texto truncado
  E /routes/R-204 renderiza bloco destacado com validade "Válido até 20/10 23:59"
```

**Cenário 2 — Edge case: aviso expira e some**
```
Dado que a R-204 tem aviso válido até 2026-10-20T23:59
Quando são 00:00 do dia 21/10 e um passageiro abre /schedules
Então GET /api/schedules para R-204 retorna announcement_text = NULL e expires_at = NULL
  E o ScheduleCard não renderiza mais o banner
```

**Cenário 3 — Erro: tentar salvar texto sem expires_at**
```
Dado que a cooperativa digita o texto do aviso
  E não preenche o campo expires_at
Quando ela clica em salvar
Então o front bloqueia o submit com mensagem contextual no form
  OU o backend rejeita com 422 e message "expires_at obrigatório quando text presente"
  E o aviso NÃO é gravado
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.1 UC-F1 "Escopo Negativo":

- **NÃO** criar entidade `announcements` separada. São 2 colunas em `routes`.
- **NÃO** permitir markdown/HTML — texto puro.
- **NÃO** adicionar notificação push para passageiros (D6).
- **NÃO** criar histórico de avisos. Edição sobrescreve.
- **NÃO** permitir aviso em nível de cooperativa ("Toda nossa frota em recesso").
- **NÃO** adicionar tipos ("urgente", "informativo") — texto puro é suficiente.

Reforço §6.3: sem XSS (texto puro), sem notificação externa.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2 Bloco S:
- **Nenhuma dependência interna** no Bloco S.
- **~> UC-A6:** PUT da rota passa pelo middleware de updated_by/updated_at (A6 recomendado cedo na onda).
- **~> UC-A3 (Onda 2):** quando UC-A3 duplicar rota, aviso **NÃO é copiado** (ver UC-A3 escopo negativo).

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- Nenhum risco específico aplicável.

## Perguntas residuais

Nenhuma.
