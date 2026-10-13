# Milestone 1 — Fase 1 (Pré-backend)

**Objetivo:** destravar valor no front enquanto o backend é iniciado em paralelo. Nenhum ticket desta fase muda contrato.

**Esforço total:** 3d (com 1 dev) ou 2d (com 2 devs).

## Tickets

| # | Ticket | Blocked by | Est. | Labels |
|---|--------|-----------|------|--------|
| [01](./01-destravar-filtro-mock.md) | Destravar filtro `date`/`dayOfWeek` no mock | — | 0.5d | fase1, front, passageiro |
| [02](./02-tabs-temporais.md) | Tabs temporais em `/schedules` | 01 | 1.5d | fase1, front, passageiro |
| [03](./03-recategorizacao-60s-catalogacao.md) | Re-categorização 60s + catalogação | 02 | 0.5d | fase1, front, passageiro |
| [04](./04-banner-cancelamento-favoritos.md) | Banner de cancelamento em favoritos | — | 0.5d | fase1, front, passageiro |
| [05](./05-higiene-mock-cooperative-filter.md) | Higiene mock: auto-filtro `cooperative_id` | — | 0.5d | fase1, front, cooperativa |

## Grafo

```
01 → 02 → 03
04  (independente)
05  (independente)
```

## PRDs de origem

- Tickets 01, 02, 03 → `../../prds/fase1-01-uc-p4-pa2-tabs-temporais.md`
- Ticket 04 → `../../prds/fase1-02-uc-pa1-banner-cancelamento.md`
- Ticket 05 → `../../prds/fase1-03-higiene-mock-cooperative-filter.md`
