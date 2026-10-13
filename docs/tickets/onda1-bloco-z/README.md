# Milestone 2 — Onda 1 Bloco Z (zero contrato novo + Bloco P do roadmap)

**Objetivo:** destravar UCs que não exigem schema aditivo próprio. Inclui UC-A13, UC-A17 (zero backend) e UC-P1/UC-P2 (consumidores de endpoints novos adicionados ao backend inicial por D21).

**Esforço total:** 5–7d.

## Tickets

| # | Ticket | Blocked by | Est. | Labels |
|---|--------|-----------|------|--------|
| [01](./01-driver-my-delays.md) | Página `/driver/my-delays` (UC-A13) | — | 1d | onda1, bloco-z, front, motorista |
| [02](./02-command-palette-core.md) | Command palette core (UC-A17) | — | 1.5d | onda1, bloco-z, front, transversal |
| [03](./03-command-palette-catalogo.md) | Catálogo de comandos por role (UC-A17) | 02 | 1.5d | onda1, bloco-z, front, transversal |
| [04](./04-uc-p1-cities-served.md) | UC-P1 — `/about` consome endpoint | Backend expor endpoint | 1d | onda1, bloco-z, front, passageiro |
| [05](./05-uc-p2-destinations-popular.md) | UC-P2 — PopularRoutesSection consome endpoint | Backend expor endpoint | 1d | onda1, bloco-z, front, passageiro |

## Grafo

```
01, 04, 05  (independentes)
02 → 03
```

## PRDs de origem

- Ticket 01 → `../../prds/onda1-03-uc-a13-driver-my-delays.md`
- Tickets 02, 03 → `../../prds/onda1-04-uc-a17-command-palette.md`
- Ticket 04 → `../../prds/onda1-01-uc-p1-cities-served.md`
- Ticket 05 → `../../prds/onda1-02-uc-p2-destinations-popular.md`
