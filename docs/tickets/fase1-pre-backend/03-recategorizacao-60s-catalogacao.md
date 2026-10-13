# 03: Re-categorização automática a cada 60s + catalogação

**PRD de origem:** [`../../prds/fase1-01-uc-p4-pa2-tabs-temporais.md`](../../prds/fase1-01-uc-p4-pa2-tabs-temporais.md)

**Milestone:** Fase 1 — Pré-backend

**What to build:** schedule que cruza fronteira de janela temporal (ex: um horário "Partindo Agora" que vira "Decorrido" quando passam 30min do seu horário) muda de aba automaticamente sem o passageiro recarregar nem o front refetchar. Apenas re-categorização local do array já carregado via `useInterval` de 60s. Também cataloga a feature de tabs em `/admin/components-preview`.

**Blocked by:** 02

**Status:** ready-for-agent

**Estimativa:** 0.5d

**Labels:** `fase1`, `front`, `passageiro`

## Acceptance criteria

- [ ] `useInterval` de 60s dispara re-cálculo das categorias (Partindo Agora / Próximos / Decorridos).
- [ ] Nenhuma chamada de rede é feita no tick (apenas computação local).
- [ ] Schedule que cruza `-30min` passa de "Partindo Agora" para "Decorridos" automaticamente.
- [ ] Schedule que entra em `-30min a +60min` passa a aparecer em "Partindo Agora".
- [ ] Contadores nos labels das abas atualizam sem flicker.
- [ ] Tabs catalogadas em `/admin/components-preview` com exemplo de cada aba e descrição das janelas.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
