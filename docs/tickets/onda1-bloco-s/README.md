# Milestone 3 — Onda 1 Bloco S (contrato aditivo independente)

**Objetivo:** entregar as mudanças aditivas de schema que não têm dependência entre si no plano de contrato. Recomendação: S-01 (middleware updated_by/at) entra **cedo** na onda para que PUT/PATCH subsequentes já carreguem a trilha.

**Esforço total:** 7–8d.

## Tickets

| # | Ticket | Blocked by | Est. | Labels |
|---|--------|-----------|------|--------|
| [01](./01-updated-by-migration-middleware.md) | UC-A6 — migration 10 colunas + middleware Fastify | — | 1.5d | onda1, bloco-s, fullstack |
| [02](./02-updated-by-labels-detail-panels.md) | UC-A6 — labels "Última alteração por X" | 01 | 1d | onda1, bloco-s, front, admin |
| [03](./03-horario-temporario-driver.md) | UC-A7 — horário temporário com substituto (fullstack) | — | 2d | onda1, bloco-s, fullstack, cooperativa |
| [04](./04-rotas-orfas.md) | UC-A10 — rotas órfãs (fullstack) | — | 1.5d | onda1, bloco-s, fullstack, admin, cooperativa |
| [05](./05-aviso-cooperativa-backend.md) | UC-F1 — backend aviso cooperativa→passageiro | — | 1d | onda1, bloco-s, back |
| [06](./06-aviso-cooperativa-frontend.md) | UC-F1 — frontend aviso (admin edit + público view) | 05 | 1d | onda1, bloco-s, front, cooperativa, passageiro |

## Grafo

```
01 → 02
03, 04  (independentes)
05 → 06
```

## PRDs de origem

- Tickets 01, 02 → `../../prds/onda1-05-uc-a6-updated-by.md`
- Ticket 03 → `../../prds/onda1-06-uc-a7-schedules-temporary-driver.md`
- Ticket 04 → `../../prds/onda1-07-uc-a10-rotas-orfas.md`
- Tickets 05, 06 → `../../prds/onda1-08-uc-f1-aviso-cooperativa-passageiro.md`
