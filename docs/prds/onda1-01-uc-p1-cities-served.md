# PRD — UC-P1 — Página `/about` consome `GET /api/cities/served`

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial
> **Persona:** Público / Passageiro
> **Decisões relacionadas:** D21 (entra na Onda 1 — v1.1.0).

## 1. Resumo

Substituir a lista hardcoded de cidades atendidas em `/about` (`about.tsx:126`) pela chamada ao endpoint `GET /api/cities/served` já definido em `api-spec.md §2.3`. Entrada na Onda 1 por D21 — destrava `cities.photo_url` ter consumer natural (resolve R9 do roadmap v1.0.0).

## 2. Problema real + usuário impactado

**Persona:** passageiro público, visitante da página institucional `/about`.

**Problema:** lista de cidades atendidas é hardcoded no front — a cada cidade nova atendida, exige PR de edição manual. Com a plataforma crescendo (contexto: Programa Cid Gomes com 164 linhas, 27 cooperativas — doc base §1.3), manter a lista editorial não escala.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.1 "UC-P1 — Página `/about` consome `GET /api/cities/served`" (linhas ~238–264) + Status v1.1.0 por D21.
- **Doc base — D21:** §3.7 (linha ~178).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco P — Pré-existentes do PRD" linha UC-P1.
- **API-spec:** `api-spec.md §2.3` (endpoint referenciado).

## 4. User stories

1. **Como** visitante de `/about`, **quero** ver a lista real de cidades atendidas, **para** confiar que a plataforma cobre a região que me interessa.
2. **Como** passageiro em cidade recém-adicionada, **quero** ver minha cidade aparecer sem esperar uma release do front, **para** entender rapidamente que a plataforma me serve.
3. **Como** admin da plataforma adicionando cidade nova, **quero** que a página `/about` reflita a adição ao criar a primeira rota ativa dessa cidade, **para** não precisar sincronizar manualmente conteúdo editorial.
4. **Como** passageiro em rede fraca, **quero** fallback estático se o endpoint falhar, **para** a página institucional não quebrar.
5. **Como** passageiro em plataforma recém-lançada com 0 cidades no response, **quero** mensagem "Em breve, atendemos novas cidades" em vez de seção vazia, **para** não parecer bug.

## 5. Requisitos funcionais

- **RF1** — Chamar `GET /api/cities/served` em `/about` via hook novo `useCitiesServed()` com React Query.
- **RF2** — Endpoint retorna `{ cities: [{ id, name, state, active_routes }], total }`.
- **RF3** — Critério de inclusão: cidade com ≥1 rota ativa (`routes.status = 'active' AND deleted_at IS NULL`), seja como origem ou destino.
- **RF4** — Loading state: skeleton com 6 placeholders de cidade.
- **RF5** — Error state silencioso: fallback para lista estática atual + `console.error` com contexto. Sem toast ao usuário.
- **RF6** — `staleTime` 1h no cliente (lista muda devagar).
- **RF7** — Edge case `cities: []`: renderizar mensagem "Em breve, atendemos novas cidades" (não lista vazia).
- **RF8** — Edge case cidade com 0 rotas ativas: não aparece no response (backend não a retorna).
- **RF9** — Edge case cidade com rotas suspensas: não aparece (`status = 'active'` apenas).
- **RF10** — Endpoint é público (sem auth); rate limit padrão 120/min.
- **RF11** — Remoção da constante hardcoded em `about.tsx:126` no **mesmo PR** (sem coexistência — convenção §9.3 doc base).

## 6. Requisitos não-funcionais

- **Performance:** cache cliente 1h; backend pode cachear response 15min (não obrigatório). Query custa pouco com índice em `routes.status`.
- **Acessibilidade:** lista de cidades em `<ul>` semântico, cada item com `aria-label` completo. Skeleton tem `aria-busy="true"` + `aria-label="Carregando cidades"`.
- **Mobile-first:** grid responsivo (ex: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- **Rede fraca:** 1 chamada única cacheada 1h; fallback estático se falhar.

## 7. Fluxo UX detalhado

1. Passageiro abre `/about`.
2. Hook `useCitiesServed()` dispara `GET /api/cities/served`.
3. Loading: skeleton de 6 cards.
4. Response 200 com `cities.length > 0`: renderizar grid.
5. Response 200 com `cities: []`: mensagem "Em breve, atendemos novas cidades".
6. Erro (4xx/5xx/timeout): usar fallback estático hardcoded no front como último recurso + `console.error`.
7. Zero chamada subsequente dentro da `staleTime` de 1h.

## 8. Mudanças de API/schema

- **Endpoint:** `GET /api/cities/served` (novo em §7.3 do doc base por D21).
- **Response:** `{ cities: [{ id, name, state, active_routes }], total }`.
- **Schema aditivo (D21):** nenhum aditivo próprio deste UC. `cities.photo_url` fica como consumer-pendente (ver §6.4 "Riscos resolvidos" do roadmap — coluna existe por §7.1 item 7 do doc base; consumer efetivo é reavaliação futura).

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: 5 cidades retornadas, grid renderiza**
```
Dado que o backend retorna { cities: [Juazeiro, Crato, Barbalha, Iguatu, Russas], total: 5 }
Quando o passageiro abre /about
Então a seção "Cidades atendidas" renderiza 5 cards (nome + estado + contagem de rotas ativas)
  E não há elementos da lista hardcoded antiga
```

**Cenário 2 — Edge case: plataforma nova, 0 cidades**
```
Dado que o backend retorna { cities: [], total: 0 }
Quando o passageiro abre /about
Então a seção renderiza a mensagem "Em breve, atendemos novas cidades"
  E não renderiza grid vazio
```

**Cenário 3 — Erro: fallback silencioso**
```
Dado que o backend retorna 500
Quando o passageiro abre /about
Então a seção renderiza a lista estática antiga (fallback)
  E console.error registra o erro
  E nenhum toast é exibido ao usuário
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.1 UC-P1 "Escopo Negativo":

- **NÃO** adicionar `cities.photo_url` neste UC (segue consumer-pendente).
- **NÃO** criar filtro de busca na `/about` (é institucional, não listagem).
- **NÃO** adicionar estatísticas além de `active_routes` (sem população, sem demográficos).
- **NÃO** inventar lista "cidades em breve" sem dado real.

Reforço §6.3: sem invenção de métrica fora do schema.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2 Bloco P:
- **Depende do backend inicial expor `GET /api/cities/served`** — não pode subir antes.
- **Nenhuma dependência interna** com UC-P2 ou outros UCs da Onda 1 (podem rodar em paralelo após backend expor).
- **~> R9 resolvido** por este UC (destrava consumer de `cities.photo_url`).

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- Nenhum risco específico de produto (§6.1) aplicável.
- Risco técnico implícito: backend atrasar em expor o endpoint — Bloco P travaria até lá (§6.3).

## Perguntas residuais

Nenhuma.
