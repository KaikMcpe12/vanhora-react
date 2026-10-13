# Tickets — VanHora Fase 1 + Onda 1

25 tickets organizados em 4 milestones. Cada ticket é 1 PR mergeável. Todos derivam dos PRDs em `../prds/` e respeitam as dependências do roadmap `../roadmap-execucao.md` §2.

Para a origem canônica (lei) consulte `../vanhora-decisoes-e-casos-de-uso.md` v1.1.0.

## Milestones

| # | Milestone | Tickets | Esforço revisto |
|---|-----------|---------|-----------------|
| 1 | [fase1-pre-backend](./fase1-pre-backend/) | 5 | 3d |
| 2 | [onda1-bloco-z](./onda1-bloco-z/) — zero contrato novo (inclui Bloco P do roadmap) | 5 | 5–7d |
| 3 | [onda1-bloco-s](./onda1-bloco-s/) — contrato aditivo independente | 6 | 7–8d |
| 4 | [onda1-bloco-d](./onda1-bloco-d/) — dependência sequencial | 9 | 10–12d |
| | **Total** | **25** | **~25–30d** |

## Status padrão

Todos os tickets nascem com `Status: ready-for-agent` (padrão do skill `/to-tickets`). Agente/dev pega qualquer ticket cuja lista "Blocked by" esteja completamente concluída.

## Convenção de arquivo

```
docs/tickets/<milestone>/<NN>-<slug>.md
```

Numeração `NN` é por milestone, em ordem de dependência (bloqueadores primeiro).

## Como ler um ticket

Cada ticket contém:
- **PRD de origem** — link direto para o PRD canônico. Divergência de regra → prevalece o PRD.
- **Milestone** — Fase 1 ou Bloco Z/S/D da Onda 1.
- **What to build** — comportamento end-to-end do ponto de vista do usuário.
- **Blocked by** — tickets gatilho ou "None (can start immediately)".
- **Status** — `ready-for-agent`.
- **Acceptance criteria** — subset verificável do PRD.
- **Estimativa** — em dias.
- **Labels** — `fase1`/`onda1`, `front`/`back`/`fullstack`, persona.

## Como pegar um ticket

1. Confira que todos os bloqueadores estão com PR mergeado em `main`.
2. Leia o PRD de origem na íntegra (ticket é subset).
3. Siga convenções técnicas de `../vanhora-decisoes-e-casos-de-uso.md` §9.
4. Antes de PR: `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes + testes de teclado.
5. Catalogação de componente novo em `/admin/components-preview` (quando aplicável).
