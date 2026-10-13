# Milestone 4 — Onda 1 Bloco D (dependência sequencial)

**Objetivo:** entregar os UCs com dependências internas duras: UC-A1 → UC-A2 (reusam `/bulk`) + UC-F4 → UC-A18 (ambos no bundle A18+F4, D30). UC-A1 é o maior item da onda (5–7d) — começar cedo.

**Esforço total:** 10–12d.

## Tickets

| # | Ticket | Blocked by | Est. | Labels |
|---|--------|-----------|------|--------|
| [01](./01-bulk-endpoint-backend.md) | UC-A1 — Backend `/schedules-exceptions/bulk` + `driver_id` | — | 2d | onda1, bloco-d, back |
| [02](./02-admin-bulk-bar.md) | UC-A1 — `AdminBulkBar` + checkbox nas rows | — | 1.5d | onda1, bloco-d, front, admin, cooperativa |
| [03](./03-bulk-exception-modal.md) | UC-A1 — `BulkExceptionModal` + `DateRangeField` | — | 1.5d | onda1, bloco-d, front, admin, cooperativa |
| [04](./04-bulk-integracao.md) | UC-A1 — Integração end-to-end + 207 handling | 01, 02, 03 | 1.5d | onda1, bloco-d, fullstack, admin, cooperativa |
| [05](./05-recesso-backend.md) | UC-A2 — Backend aceita `route_ids` + limite 60d | 01 | 1d | onda1, bloco-d, back |
| [06](./06-recesso-modal.md) | UC-A2 — `RecessModal` + integração | 05, 03 | 1.5d | onda1, bloco-d, front, admin, cooperativa |
| [07](./07-f4-resolved-backend.md) | UC-F4 — Backend migration + endpoints resolve/reopen | — | 1d | onda1, bloco-d, back |
| [08](./08-f4-resolved-frontend.md) | UC-F4 — Botões resolve/reopen + badge "Resolvido" | 07 | 1d | onda1, bloco-d, front, admin, cooperativa |
| [09](./09-a18-deep-links.md) | UC-A18 — Deep-links `?today`/`?mine` + itens de menu | 07 | 1d | onda1, bloco-d, front, transversal |

## Grafo

```
01 ──┬─ 04 ← 02, 03
     └─ 05 → 06 ← 03
02, 03  (paralelos entre si e a 01)
07 ──┬─ 08
     └─ 09
```

## PRDs de origem

- Tickets 01, 02, 03, 04 → `../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md`
- Tickets 05, 06 → `../../prds/onda1-10-uc-a2-excecao-intervalo.md`
- Tickets 07, 08, 09 → `../../prds/onda1-11-uc-a18-f4-deep-links-resolved.md` (bundle A18+F4, D30 — 3 tickets filhos)
