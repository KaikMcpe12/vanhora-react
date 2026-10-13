# PRD — UC-A7 — Horário temporário com motorista substituto

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco S — contrato aditivo independente)
> **Persona:** Cooperativa (criador do serviço extra), Motorista (substituto designado)

## 1. Resumo

Cooperativa cria horário extra para dia específico (ex: feriado alta-demanda) e precisa atribuir motorista **diferente do titular da rota** só naquela instância. Este UC adiciona 1 coluna `driver_id` em `schedules_temporary` + validação de pertencimento à mesma cooperativa + campo no modal "Serviço extra".

## 2. Problema real + usuário impactado

**Persona:** cooperativa gestora, motorista titular da rota, motorista substituto designado.

**Problema:** hoje `schedules_temporary` herda `routes.drive_id` (titular da rota) sem possibilidade de override. Em dia de alta demanda, cooperativa precisa escalar um substituto só pra esse serviço extra sem mudar o titular normal da rota. Hoje impossível sem workaround confuso (ex: trocar titular, criar extra, voltar o titular — frágil).

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.3 "UC-A7 — Horário temporário com motorista substituto" (linhas ~711–741).
- **Doc base — Schema:** §7.2 item 13 (linha ~1104).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco S" linha UC-A7.

## 4. User stories

1. **Como** cooperativa criando serviço extra em feriado, **quero** escolher um motorista substituto diferente do titular, **para** o titular manter o resto da grade normal.
2. **Como** cooperativa deixando o campo vazio, **quero** o sistema usar o titular da rota automaticamente, **para** não ter que preencher o óbvio.
3. **Como** cooperativa olhando serviço extra sem override, **quero** ver o titular herdado no card, **para** não parecer "sem motorista".
4. **Como** cooperativa com motorista titular inativo e sem substituto definido, **quero** ver alerta "Rota sem motorista — defina um substituto" + badge âmbar, **para** não deixar o serviço rodar sem responsável.
5. **Como** admin tentando atribuir motorista de outra cooperativa, **quero** erro 422, **para** manter isolamento.
6. **Como** cooperativa atribuindo motorista já escalado no mesmo horário em outro schedule, **quero** warning amarelo (não bloqueio), **para** decidir se aceito a sobreposição.

## 5. Requisitos funcionais

- **RF1** — Adicionar coluna `driver_id uuid NULL` em `schedules_temporary` com FK para `users.id`.
- **RF2** — Semântica:
  - `NULL` → herda `routes.drive_id` (titular da rota do schedule_temporary).
  - Preenchido → override apenas para aquela ocorrência.
- **RF3** — `routes.drive_id` não é alterado (titular normal continua).
- **RF4** — Backend valida (camada de aplicação): `driver_id` precisa ter `cooperative_id = schedule_temporary.route.cooperative_id`. Rejeita com 422 em caso contrário.
- **RF5** — Validação de role: `driver_id` precisa referenciar usuário com `role = 'driver'`. Se não, rejeita 422.
- **RF6** — Endpoint `POST /api/admin/schedules-temporary` aceita campo opcional `driver_id`.
- **RF7** — Modal `ExceptionModal` em modo "Serviço extra" ganha campo "Motorista" (reusar `SearchableSelect`). Hint: *"Se vazio, usa o titular da rota"*. Default: vazio.
- **RF8** — Edge case titular `inactive` + sem override: UI do card do serviço extra alerta "Rota sem motorista — defina um substituto" + badge âmbar (`StatusChip` tone `warning`).
- **RF9** — Edge case motorista escolhido já está em outro schedule no mesmo horário: **backend permite** (não é conflito de banco); **front mostra warning amarelo** antes do submit ("Esse motorista já tem um horário próximo às HH:MM — deseja continuar?").
- **RF10** — Resposta GET de `schedules_temporary` traz `driver` resolvido (`{ id, name }` ou herdado da rota).

## 6. Requisitos não-funcionais

- **Performance:** FK já indexada por padrão. Index composto `(route_id, date)` previsto em `api-spec.md` cobre consultas comuns.
- **Acessibilidade:** `SearchableSelect` já segue convenção PR8 (teclado + aria). Warning amarelo tem `role="alert"`.
- **Segurança:** validação de pertencimento à cooperativa é feita na **camada de aplicação** (SQL check FK de 2 níveis não é prático). Backend verifica `driver.cooperative_id === route.cooperative_id` antes do commit.

## 7. Fluxo UX detalhado

1. Cooperativa abre modal "Serviço extra" (variação de `ExceptionModal`).
2. Seleciona rota, data, horário.
3. Campo "Motorista" (`SearchableSelect`) com placeholder "Usar titular da rota (padrão)".
4. Cooperativa deixa vazio OU seleciona um substituto.
5. Submit → `POST /api/admin/schedules-temporary` com `driver_id` (ou omitido).
6. Backend valida (cooperativa + role). Se OK, cria linha. Se não, 422.
7. UI do board/listagem renderiza o serviço extra. Card mostra:
   - Nome do motorista (titular ou substituto).
   - Badge "Substituto" se `driver_id IS NOT NULL` E `driver_id != route.drive_id`.
8. Edge case — titular inativo + sem override:
   - Card renderiza em tom âmbar.
   - Mensagem: "Rota sem motorista — defina um substituto".
   - CTA abre modal com campo "Motorista" obrigatório pré-focado.
9. Edge case — tentativa de atribuir motorista de outra cooperativa: 422 → toast de erro contextual.
10. Edge case — sobreposição de horários: front detecta antes do submit (consulta local) e exibe warning amarelo com opção "Continuar".

## 8. Mudanças de API/schema

- **Schema (§7.2 item 13 doc base):** `schedules_temporary.driver_id uuid NULL FK` (1 coluna aditiva).
- **Endpoint:** `POST /api/admin/schedules-temporary` ganha campo opcional `driver_id`. Nenhum endpoint novo.
- **Response:** GET de schedules temporários inclui `driver` resolvido.

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: cooperativa cria serviço extra com substituto**
```
Dado que a rota R-204 tem titular "João" (role driver, cooperativa Alpha)
  E a cooperativa Alpha quer criar serviço extra no sábado 20/10 com substituto "Pedro"
  E Pedro também é driver da Alpha
Quando a cooperativa submete o modal com driver_id = Pedro
Então o backend cria schedules_temporary com driver_id = Pedro.id
  E routes.drive_id (João) permanece inalterado
  E o card no board mostra "Pedro" + badge "Substituto"
```

**Cenário 2 — Edge case: campo vazio herda o titular**
```
Dado que a cooperativa Alpha cria serviço extra na rota R-204 (titular João)
  E deixa o campo "Motorista" vazio no modal
Quando ela submete
Então schedules_temporary.driver_id = NULL
  E o card no board mostra "João" (sem badge "Substituto")
  E a hint "Se vazio, usa o titular da rota" é mostrada no modal
```

**Cenário 3 — Erro: tentar atribuir motorista de outra cooperativa**
```
Dado que a cooperativa Alpha cria serviço extra
  E seleciona Pedro (driver da cooperativa Beta) como substituto
Quando ela submete
Então o backend retorna 422 com message "Motorista não pertence à sua cooperativa"
  E o modal não fecha
  E um toast de erro contextual aparece
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.3 UC-A7 "Escopo Negativo":

- **NÃO** sugerir "melhor substituto" via IA (D-globais §6.3).
- **NÃO** permitir atribuir usuário com role ≠ `driver`.
- **NÃO** criar validação de "motorista disponível" (sem registro formal de ausência — A15/4.2 descartado D12).
- **NÃO** notificar motorista substituto (sem canal — D6).

Reforço §6.3: sem notificação, sem IA.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2 Bloco S:
- **Nenhuma dependência interna** com outros UCs do Bloco S.
- **~> UC-A6 (middleware):** quando este UC entrar, PUT/PATCH já estarão passando pelo middleware de A6 (recomendação do roadmap §4.3).

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- Nenhum risco específico aplicável.

## Perguntas residuais

Nenhuma.
