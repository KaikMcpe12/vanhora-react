# VanHora — API Specification

Especificação canônica de todos os endpoints consumidos pelo frontend. Use este documento como referência primária para implementar o backend. Qualquer divergência entre o código do backend e este documento deve ser resolvida atualizando este arquivo.

---

## Sumário

- [1. Convenções](#1-convenções)
  - [1.1 Base URL e versionamento](#11-base-url-e-versionamento)
  - [1.2 Formato de request](#12-formato-de-request)
  - [1.3 Formato de resposta](#13-formato-de-resposta)
  - [1.4 Autenticação](#14-autenticação)
  - [1.5 Paginação](#15-paginação)
  - [1.6 Filtros](#16-filtros)
  - [1.7 Códigos de erro](#17-códigos-de-erro)
  - [1.8 Rate limiting](#18-rate-limiting)
  - [1.9 CORS](#19-cors)
- [2. Endpoints públicos](#2-endpoints-públicos)
  - [2.1 Schedules](#21-schedules)
  - [2.2 Ratings](#22-ratings)
  - [2.3 Cities](#23-cities)
  - [2.4 Cooperatives](#24-cooperatives)
  - [2.5 Destinations](#25-destinations)
  - [2.6 Routes](#26-routes)
- [3. Endpoints administrativos](#3-endpoints-administrativos)
  - [3.1 Autenticação](#31-autenticação)
  - [3.2 Usuários](#32-usuários)
  - [3.3 Schedules (admin)](#33-schedules-admin)
  - [3.4 Rotas (admin)](#34-rotas-admin)
  - [3.5 Cooperativas (admin)](#35-cooperativas-admin)
  - [3.6 Cidades (admin)](#36-cidades-admin)
  - [3.7 Atrasos (admin)](#37-atrasos-admin)
  - [3.8 Dashboard](#38-dashboard)
- [4. Mapa de consumo](#4-mapa-de-consumo)
- [5. Alterações necessárias no schema](#5-alterações-necessárias-no-schema)
- [6. Considerações de performance](#6-considerações-de-performance)

---

## 1. Convenções

### 1.1 Base URL e versionamento

```
Base URL: {VITE_API_URL}
Exemplo:  http://localhost:3333
```

sem prefixo de versão na URL por ora (`/api/v1/...`). se versionamento for necessário no futuro, adicionar `/v1/` antes dos recursos e configurar `VITE_API_URL=http://localhost:3333/v1`.

### 1.2 Formato de request

- content-type: `application/json` em todas as requisições com body
- encoding: UTF-8
- datas: ISO 8601 — `date` como `YYYY-MM-DD`, `datetime` como `YYYY-MM-DDTHH:mm:ssZ`
- horários de partida/chegada: string `HH:MM` (sem segundos), ex: `"14:30"`
- IDs: UUID v4

headers padrão:
```
Content-Type: application/json
Accept: application/json
```

### 1.3 Formato de resposta

**sucesso:**
```json
{
  "data": { ... }
}
```
ou, para listas com paginação:
```json
{
  "data": [ ... ],
  "meta": {
    "page": 0,
    "per_page": 12,
    "total": 248
  }
}
```

**erro:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "descrição legível do erro",
    "details": [ ... ]
  }
}
```

`details` é opcional e aparece em erros de validação (422) com campo-por-campo.

### 1.4 Autenticação

**endpoints públicos (`/api/*` sem prefixo admin):** sem autenticação obrigatória.

**ratings:** usa `session_id` (UUID) enviado como header ou cookie, gerado no client e persistido em `localStorage`. o backend valida unicidade de avaliação por `(schedule_id, session_id)`.

```
X-Session-Id: {uuid}
```

**endpoints admin (`/api/admin/*` e `/api/auth/*`):** JWT no header `Authorization`:

```
Authorization: Bearer {jwt_token}
```

JWT payload mínimo:
```json
{
  "sub": "user-uuid",
  "role": "admin|cooperative|driver",
  "cooperative_id": "uuid|null",
  "exp": 1720000000
}
```

tokens de acesso: validade 15 minutos. refresh tokens: validade 7 dias, rotação em cada uso.

### 1.5 Paginação

paginação baseada em offset/página. parâmetros:

- `page` (integer, default `0`, zero-indexed) — índice da página
- `limit` (integer, default `12`, max `100`) — itens por página

resposta inclui `meta.page`, `meta.per_page`, `meta.total`.

exceção: `GET /api/schedules` quando chamado pelo hook `useGroupedSchedules` passa `limit=9999` para buscar tudo e fazer agrupamento no client. o backend deve suportar isso (sem hard cap abaixo de 9999 para este endpoint).

### 1.6 Filtros

convenção de query params:

- strings: valor direto (`origin=Fortaleza` ou `origin={city_uuid}`)
- arrays: comma-separated (`ids=uuid1,uuid2,uuid3` ou `dayOfWeek=seg,ter,qua`)
- booleans: `true` / `false`
- números: valor direto (`priceMin=20.00&priceMax=80.00`)
- enums: valor do enum em snake_case

o backend deve aceitar tanto nome da cidade quanto UUID nos campos de cidade (normalizar internamente).

### 1.7 Códigos de erro

| código | quando usar |
|---|---|
| 400 | request malformado (JSON inválido, tipo errado) |
| 401 | token ausente ou inválido |
| 403 | autenticado mas sem permissão para aquele recurso/scope |
| 404 | recurso não encontrado |
| 409 | conflito (ex: email duplicado, rating já existe e não é update) |
| 422 | dados válidos mas violam regra de negócio (ex: `new_departure_time` ausente quando `type=rescheduled`) |
| 429 | rate limit excedido |
| 500 | erro interno não tratado |

### 1.8 Rate limiting

recomendado para endpoints públicos:
- `POST /api/ratings`: 5 requisições por sessão por minuto
- `GET /api/schedules`: 60 por minuto por IP
- demais endpoints públicos: 120 por minuto por IP

endpoints admin: sem rate limit estrito (usuários autenticados têm controle de sessão).

### 1.9 CORS

origens permitidas configuráveis via variável de ambiente. em desenvolvimento:
```
http://localhost:5173
```

em produção: domínio do frontend. não usar `*` (wildcard) em produção porque o frontend envia cookies de sessão.

---

## 2. Endpoints públicos

### 2.1 Schedules

#### `GET /api/schedules`

retorna lista paginada de schedules com filtros opcionais. principal endpoint do app — consumido por listagem de horários e favoritos.

**query params:**

- `origin` (string, opcional) — UUID ou nome da cidade de origem
- `destination` (string, opcional) — UUID ou nome da cidade de destino
- `date` (string `YYYY-MM-DD`, opcional, default hoje) — data da busca; o backend filtra por `day_of_week` derivado dessa data e verifica `schedules_exceptions` para aquela data
- `ids` (string comma-separated, opcional, max 150 UUIDs) — filtrar schedules por IDs específicos; usado pela página de favoritos
- `cooperative` (string, opcional) — nome ou UUID da cooperativa
- `priceMin` (number, opcional) — preço mínimo (inclusive)
- `priceMax` (number, opcional) — preço máximo (inclusive)
- `rating` (number 0–5, opcional) — rating mínimo da cooperativa
- `dayOfWeek` (string comma-separated, opcional) — dias da semana: `seg,ter,qua,qui,sex,sab,dom`
- `departureAfter` (string `HH:MM`, opcional) — horário de partida a partir de
- `departureBefore` (string `HH:MM`, opcional) — horário de partida até
- `page` (integer, default `0`)
- `limit` (integer, default `12`, max aceito pelo frontend: `9999`)

**response 200:**
```json
{
  "schedules": [
    {
      "id": "uuid",
      "departure_time": "14:00",
      "arrival_time": "17:30",
      "duration": "3h 30min",
      "day_of_week": "seg",
      "status": "active",
      "notes": null,
      "badge": "available",
      "price": 28.50,
      "origin": "Fortaleza",
      "destination": "Sobral",
      "cooperative_name": "São Benedito",
      "cooperative_image": null,
      "cooperative_rating": 4.2,
      "cooperative_reviews": 1845,
      "trip_code": "R204-0800"
    }
  ],
  "meta": {
    "page": 0,
    "per_page": 12,
    "total": 248
  }
}
```

`badge` é derivado pelo backend: `"cancelled"` se existe `schedules_exceptions` do tipo `cancelled` para `date`, `"available"` caso contrário.

**response 400:**
```json
{
  "error": { "code": "INVALID_PARAM", "message": "ids: máximo 150 IDs por requisição" }
}
```

**response 422:**
```json
{
  "error": { "code": "INVALID_UUID", "message": "ids contém UUID inválido: 'not-a-uuid'" }
}
```

**consumido por:**
- `/schedules` — `useGroupedSchedules` hook (com `limit=9999`, agrupa no client)
- `/schedules` — `useSchedules` hook (paginação infinita, limit=12)
- `/favorites` — `useSchedules({ ids: favoriteIds })` (não mais usado após PR3, mas endpoint permanece)
- `/` (home) — `HomeFeedSection` lê favoritos do localStorage e chama `getMockSchedules` diretamente hoje; quando backend existir, virará `GET /api/schedules?ids=...`

**notas sobre o schema:**
- `arrival_time` e `duration` não existem em `schedules` — devem ser calculados a partir de `routes_stop` ou hardcoded em `routes` como campo derivado
- `cooperative_name`, `cooperative_image`, `cooperative_rating`, `cooperative_reviews`, `price`, `origin`, `destination`, `trip_code` todos vêm de joins: `schedules → routes → cooperatives` e `routes → routes_stop → cities`
- `cooperative_rating` e `cooperative_reviews` são agregados de `ratings` — ver [Seção 5](#5-alterações-necessárias-no-schema) sobre materialização
- `badge` é derivado de `schedules_exceptions`; backend deve verificar para a `date` fornecida

---

#### `GET /api/schedules/:id`

retorna detalhes completos de um schedule individual. usado pelo dialog "ver detalhes" do `ScheduleCard`.

**path params:**
- `id` (UUID) — ID do schedule

**response 200:**
```json
{
  "id": "uuid",
  "departure_time": "14:00",
  "arrival_time": "17:30",
  "duration": "3h 30min",
  "day_of_week": "seg",
  "status": "active",
  "badge": "available",
  "notes": null,
  "price": 28.50,
  "origin": "Fortaleza",
  "destination": "Sobral",
  "cooperative_name": "São Benedito",
  "cooperative_image": null,
  "cooperative_rating": 4.2,
  "cooperative_reviews": 1845,
  "trip_code": "R204-0800",
  "description": "Viagem direta de Fortaleza para Sobral com paradas em pontos definidos.",
  "cities": ["Fortaleza", "Pacatuba", "Sobral"],
  "operating_days": ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
  "exception_reason": null,
  "contact": {
    "phone": "+55 85 3222-4444",
    "email": "contato@saobenedito.com.br",
    "website": "www.saobenedito.com.br"
  }
}
```

`cities` é a lista de paradas (`routes_stop` + origem e destino).
`operating_days` vem de `routes.active_days`, mapeado para português.
`contact` vem de `cooperatives` (phone_number, site) + email derivado ou campo separado.

**response 404:**
```json
{
  "error": { "code": "NOT_FOUND", "message": "schedule não encontrado" }
}
```

**consumido por:**
- `ScheduleDialog` — queryKey: `['schedule', scheduleId]`

**pendência:** `description` não existe no schema atual. ver [Seção 5](#5-alterações-necessárias-no-schema). `contact.email` também não existe em `cooperatives`.

---

### 2.2 Ratings

#### `GET /api/ratings/check/:scheduleId`

verifica se a sessão atual já avaliou um schedule específico.

**path params:**
- `scheduleId` (UUID)

**headers:**
- `X-Session-Id` (UUID, obrigatório)

**response 200 — sem avaliação:**
```json
{
  "has_rated": false
}
```

**response 200 — com avaliação:**
```json
{
  "has_rated": true,
  "rating": {
    "id": "uuid",
    "stars": 4,
    "created_at": "2026-06-15T14:22:00Z"
  }
}
```

**response 400:**
```json
{
  "error": { "code": "MISSING_SESSION", "message": "header X-Session-Id obrigatório" }
}
```

**consumido por:**
- `ScheduleDialog` — via `useRating` hook, queryKey: `['rating-check', scheduleId]`

---

#### `POST /api/ratings`

envia ou atualiza uma avaliação anônima de schedule.

**headers:**
- `X-Session-Id` (UUID, obrigatório)

**body:**
```json
{
  "schedule_id": "uuid",
  "stars": 4
}
```

validações:
- `stars`: inteiro entre 1 e 5 (inclusive)
- `schedule_id`: UUID válido, schedule deve existir
- se já existe rating com mesmo `(schedule_id, session_id)`: atualiza `stars`, retorna `action: "updated"`

**response 201 — criado:**
```json
{
  "action": "created",
  "rating": {
    "id": "uuid",
    "stars": 4
  }
}
```

**response 200 — atualizado:**
```json
{
  "action": "updated",
  "rating": {
    "id": "uuid",
    "stars": 4
  }
}
```

**response 400:**
```json
{
  "error": { "code": "MISSING_SESSION", "message": "header X-Session-Id obrigatório" }
}
```

**response 422:**
```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "stars deve ser entre 1 e 5" }
}
```

**response 404:**
```json
{
  "error": { "code": "NOT_FOUND", "message": "schedule não encontrado" }
}
```

**consumido por:**
- `ScheduleDialog` — via `useRating` hook, mutation

---

### 2.3 Cities

#### `GET /api/cities`

lista todas as cidades disponíveis na plataforma. usado pelo autocomplete de origem/destino na `SearchHeroBar` e `CityPicker`.

**query params:** nenhum (lista completa; poucas cidades, não precisa de paginação)

**response 200:**
```json
{
  "cities": [
    { "id": "uuid", "name": "Fortaleza", "state": "CE" },
    { "id": "uuid", "name": "Sobral", "state": "CE" },
    { "id": "uuid", "name": "Juazeiro do Norte", "state": "CE" },
    { "id": "uuid", "name": "Crateús", "state": "CE" },
    { "id": "uuid", "name": "Quixadá", "state": "CE" },
    { "id": "uuid", "name": "Iguatu", "state": "CE" },
    { "id": "uuid", "name": "Crato", "state": "CE" }
  ]
}
```

**consumido por:**
- `SearchHeroBar` — lista de cidades no dropdown de origem/destino
- `CityPicker` — mesmo uso no `HeroSection` legado e `AdvanceFilter`
- `useUserCity` hook — após receber nome da cidade via ipinfo.io, busca aqui para obter o UUID

**notas:** hoje o frontend usa `CITIES_WITH_IDS` hardcoded em `mock-cities.ts`. quando backend existir, este endpoint substitui essa constante.

---

#### `GET /api/cities/served`

lista as cidades atendidas pela plataforma, com contagem de rotas ativas. usado pela página `/about`.

**query params:** nenhum

**response 200:**
```json
{
  "cities": [
    { "id": "uuid", "name": "Fortaleza", "state": "CE", "active_routes": 24 },
    { "id": "uuid", "name": "Sobral", "state": "CE", "active_routes": 18 },
    { "id": "uuid", "name": "Juazeiro do Norte", "state": "CE", "active_routes": 15 }
  ],
  "total": 7
}
```

**consumido por:**
- `/about` — seção "Cidades atendidas" (hoje hardcoded; quando backend existir, dinamizar)

---

### 2.4 Cooperatives

#### `GET /api/cooperatives`

lista cooperativas com paginação e ordenação. usado pela `PartnerCoopsSection` na home e pelo `CooperativePicker`.

**query params:**
- `page` (integer, default `0`)
- `limit` (integer, default `10`)
- `sort` (string, opcional) — `route_count:desc` | `rating:desc` | `name:asc`
- `status` (string, opcional) — `active` | `inactive`
- `search` (string, opcional) — busca por nome

**response 200:**
```json
{
  "cooperatives": [
    {
      "id": "uuid",
      "name": "São Benedito",
      "phone_number": "+55 85 3222-4444",
      "logo_url": null,
      "site": "www.saobenedito.com.br",
      "brand_color": "#185FA5",
      "rating": 4.2,
      "rating_count": 1845,
      "route_count": 12,
      "cities_served": ["Fortaleza", "Sobral", "Camocim", "Acaraú"]
    }
  ],
  "meta": {
    "page": 0,
    "per_page": 10,
    "total": 10
  }
}
```

**consumido por:**
- `PartnerCoopsSection` (home) — `?limit=3&sort=route_count:desc`
- `CooperativePicker` (advance filter, admin forms) — lista completa
- futura página `/cooperatives`

**pendências:** `brand_color`, `rating`, `rating_count`, `route_count`, `cities_served` não existem em `cooperatives`. ver [Seção 5](#5-alterações-necessárias-no-schema).

---

#### `GET /api/cooperatives/:id`

detalhe completo de uma cooperativa.

**path params:**
- `id` (UUID)

**response 200:**
```json
{
  "id": "uuid",
  "name": "São Benedito",
  "phone_number": "+55 85 3222-4444",
  "logo_url": null,
  "site": "www.saobenedito.com.br",
  "brand_color": "#185FA5",
  "rating": 4.2,
  "rating_count": 1845,
  "route_count": 12,
  "cities_served": ["Fortaleza", "Sobral", "Camocim", "Acaraú"],
  "routes": [
    {
      "id": "uuid",
      "name": "Fortaleza → Sobral (direto)",
      "origin": "Fortaleza",
      "destination": "Sobral",
      "price": 28.50,
      "active_days": ["seg", "ter", "qua", "qui", "sex"],
      "status": "active"
    }
  ]
}
```

**response 404:**
```json
{ "error": { "code": "NOT_FOUND", "message": "cooperativa não encontrada" } }
```

**consumido por:**
- futura página `/cooperatives/:id`

---

### 2.5 Destinations

#### `GET /api/destinations/summary`

retorna resumo agregado de múltiplas cidades destino (contagem de schedules e preço mínimo para hoje). usado pelos `DestinationCard` na home.

**query params:**
- `cities` (string comma-separated, obrigatório) — nomes ou UUIDs das cidades destino, ex: `cities=Sobral,Juazeiro do Norte,Crato`
- `date` (string `YYYY-MM-DD`, opcional, default hoje)

**response 200:**
```json
{
  "summaries": [
    {
      "city_id": "uuid",
      "city_name": "Sobral",
      "city_state": "CE",
      "schedule_count": 18,
      "price_from": 28.50,
      "primary_cooperative": {
        "name": "São Benedito",
        "brand_color": "#185FA5"
      }
    },
    {
      "city_id": "uuid",
      "city_name": "Juazeiro do Norte",
      "city_state": "CE",
      "schedule_count": 12,
      "price_from": 52.00,
      "primary_cooperative": {
        "name": "Nordeste",
        "brand_color": "#0F6E56"
      }
    }
  ]
}
```

`schedule_count`: schedules ativos para aquela cidade destino na data fornecida.
`price_from`: menor preço dentre os schedules ativos para aquela cidade.
`primary_cooperative`: cooperativa com mais schedules para aquele destino na data.

**response 400:**
```json
{ "error": { "code": "MISSING_PARAM", "message": "parâmetro 'cities' é obrigatório" } }
```

**consumido por:**
- `PopularRoutesSection` (home) — para 6 destinos curados
- `HomeFeedSection` (home) — potencialmente para enriquecer chips de buscas recentes

**notas:** hoje simulado por `getDestinationSummaries()` em `src/lib/api/mock-destinations-api.ts`. endpoint real deve fazer a mesma lógica via query SQL.

---

#### `GET /api/destinations/popular`

lista de destinos populares definida pelo backend (por volume de schedules ou critério editorial).

**query params:**
- `limit` (integer, default `6`)
- `date` (string `YYYY-MM-DD`, opcional, default hoje)

**response 200:**
```json
{
  "destinations": [
    {
      "city_id": "uuid",
      "city_name": "Sobral",
      "city_state": "CE",
      "is_popular": true,
      "schedule_count": 18,
      "price_from": 28.50,
      "primary_cooperative": {
        "name": "São Benedito",
        "brand_color": "#185FA5"
      }
    }
  ]
}
```

`is_popular`: flag editorial — backend decide critério (top 2 por volume, ou campo `cities.is_featured`).

**consumido por:**
- futura versão da `PopularRoutesSection` (hoje usa lista estática hardcoded)

---

### 2.6 Routes

#### `GET /api/routes/:id`

detalhe de uma rota específica com estatísticas básicas.

**path params:**
- `id` (UUID)

**response 200:**
```json
{
  "id": "uuid",
  "name": "Fortaleza → Sobral (direto)",
  "code": "R-204",
  "origin": { "id": "uuid", "name": "Fortaleza", "state": "CE" },
  "destination": { "id": "uuid", "name": "Sobral", "state": "CE" },
  "price": 28.50,
  "active_days": ["seg", "ter", "qua", "qui", "sex"],
  "status": "active",
  "cooperative": {
    "id": "uuid",
    "name": "São Benedito",
    "phone_number": "+55 85 3222-4444",
    "brand_color": "#185FA5"
  },
  "stops": [
    { "position": 1, "city": { "id": "uuid", "name": "Fortaleza", "state": "CE" }, "departure_time": "06:00", "estimated_duration": "00:00:00" },
    { "position": 2, "city": { "id": "uuid", "name": "Pacatuba", "state": "CE" }, "departure_time": "06:45", "estimated_duration": "00:45:00" },
    { "position": 3, "city": { "id": "uuid", "name": "Sobral", "state": "CE" }, "departure_time": "09:30", "estimated_duration": "03:30:00" }
  ],
  "schedules_count": 5,
  "rating": { "average": 4.2, "count": 1845 }
}
```

**response 404:**
```json
{ "error": { "code": "NOT_FOUND", "message": "rota não encontrada" } }
```

**consumido por:**
- futura página `/routes/:id`

---

#### `GET /api/routes/:id/schedules`

lista os schedules de uma rota específica.

**path params:**
- `id` (UUID) — ID da rota

**query params:**
- `date` (string `YYYY-MM-DD`, opcional, default hoje)
- `page` (integer, default `0`)
- `limit` (integer, default `12`)

**response 200:**
```json
{
  "schedules": [
    {
      "id": "uuid",
      "departure_time": "06:00",
      "arrival_time": "09:30",
      "day_of_week": "seg",
      "status": "active",
      "badge": "available",
      "notes": null
    }
  ],
  "meta": {
    "page": 0,
    "per_page": 12,
    "total": 5
  }
}
```

**consumido por:**
- futura página `/routes/:id`

---

#### `GET /api/routes/:id/statistics`

estatísticas agregadas de atrasos e cancelamentos dos últimos 30 dias para uma rota.

**path params:**
- `id` (UUID) — ID da rota

**query params:**
- `period` (integer, default `30`) — número de dias para retroagir

**response 200:**
```json
{
  "route_id": "uuid",
  "period_days": 30,
  "delays": {
    "total": 12,
    "average_minutes": 8.5,
    "by_severity": {
      "low": 9,
      "medium": 2,
      "high": 1
    }
  },
  "cancellations": {
    "total": 2,
    "rate_percent": 1.4
  },
  "on_time_rate_percent": 98.6
}
```

**consumido por:**
- futura página `/routes/:id`

---

## 3. Endpoints administrativos

todos os endpoints abaixo requerem `Authorization: Bearer {jwt}`. o backend valida role e, quando aplicável, restringe escopo ao `cooperative_id` do usuário logado.

convenções de escopo:
- `admin`: acesso total a todos os recursos
- `cooperative`: acessa apenas recursos vinculados à sua `cooperative_id`
- `driver`: acessa apenas seus próprios dados e schedules das rotas que opera

### 3.1 Autenticação

#### `POST /api/auth/login`

autentica um usuário e retorna tokens de acesso e refresh.

**body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha_aqui"
}
```

**response 200:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "Francisco Kaik",
    "email": "kaik@email.com",
    "role": "admin",
    "cooperative_id": null
  }
}
```

**response 401:**
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "email ou senha incorretos" } }
```

**response 403:**
```json
{ "error": { "code": "USER_INACTIVE", "message": "usuário desativado" } }
```

**consumido por:**
- `/sign-in` — formulário de login

---

#### `POST /api/auth/refresh`

renova o access token usando um refresh token válido.

**body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**response 200:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

o refresh token é rotacionado a cada uso.

**response 401:**
```json
{ "error": { "code": "INVALID_REFRESH_TOKEN", "message": "refresh token inválido ou expirado" } }
```

**consumido por:**
- interceptor de axios/fetch no frontend para renovação automática

---

#### `POST /api/auth/logout`

invalida o refresh token atual.

**headers:** `Authorization: Bearer {access_token}`

**body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**response 204:** sem body

**consumido por:**
- botão de logout no portal

---

#### `GET /api/auth/me`

retorna dados do usuário autenticado.

**headers:** `Authorization: Bearer {access_token}`

**response 200:**
```json
{
  "id": "uuid",
  "name": "Francisco Kaik",
  "email": "kaik@email.com",
  "role": "admin",
  "cooperative_id": null,
  "status": "active",
  "created_at": "2026-01-15T10:00:00Z"
}
```

**consumido por:**
- `AppPortalLayout` para verificar role e montar contexto de navegação

---

### 3.2 Usuários

#### `GET /api/admin/users`

lista usuários com filtros, paginação e restrição de escopo por role.

**roles autorizados:** `admin`, `cooperative`

**regra de escopo:** usuários com role `cooperative` só veem usuários vinculados à sua `cooperative_id`.

**query params:**
- `search` (string, opcional) — busca por nome ou email (like)
- `role` (string, opcional) — `admin` | `cooperative` | `driver`
- `cooperative_id` (UUID, opcional) — filtro por cooperativa (apenas admin pode filtrar por cooperativa arbitrária)
- `status` (string, opcional) — `active` | `inactive`
- `page` (integer, default `1`, 1-indexed para este endpoint)
- `page_size` (integer, default `10`, max `100`)

**response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Francisco Kaik",
      "email": "kaik@email.com",
      "role": "admin",
      "cooperative_id": null,
      "cooperative_name": null,
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 10
}
```

**notas:** `cooperative_name` é campo derivado via join com `cooperatives`. a paginação deste endpoint usa `page` 1-indexed (conforme `listUsersFilterSchema` do frontend), diferente dos demais endpoints que usam 0-indexed.

**consumido por:**
- `/admin/users` e `/cooperative/users` — `UsersPage`

---

#### `POST /api/admin/users`

cria um novo usuário.

**roles autorizados:** `admin`, `cooperative` (cooperativa só pode criar `driver` vinculado a si)

**body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha_segura",
  "role": "driver",
  "cooperative_id": "uuid"
}
```

validações:
- `name`: mínimo 3 caracteres
- `email`: formato válido, único no sistema
- `password`: mínimo 8 caracteres
- `cooperative_id`: obrigatório para `role=driver` ou `role=cooperative`; proibido para `role=admin`

**response 201:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "driver",
  "cooperative_id": "uuid",
  "status": "active",
  "created_at": "2026-07-03T12:00:00Z"
}
```

**response 409:**
```json
{ "error": { "code": "EMAIL_CONFLICT", "message": "email já cadastrado" } }
```

**response 422:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "dados inválidos",
    "details": [
      { "field": "cooperative_id", "message": "cooperativa é obrigatória para role driver" }
    ]
  }
}
```

**consumido por:**
- `AddUserModal` — `UsersPage`

---

#### `PUT /api/admin/users/:id`

atualiza dados de um usuário.

**roles autorizados:** `admin`, `cooperative` (apenas seus próprios drivers)

**path params:**
- `id` (UUID)

**body:** mesmos campos do `POST`, todos opcionais. `password` só enviado se alteração de senha.

**response 200:** usuário atualizado (mesmo shape do POST 201)

**response 404:**
```json
{ "error": { "code": "NOT_FOUND", "message": "usuário não encontrado" } }
```

**response 403:**
```json
{ "error": { "code": "FORBIDDEN", "message": "sem permissão para editar este usuário" } }
```

**consumido por:**
- `EditUserModal` — `UsersPage`

---

#### `PATCH /api/admin/users/:id/status`

ativa ou desativa um usuário (soft toggle).

**roles autorizados:** `admin`, `cooperative` (apenas seus drivers)

**path params:**
- `id` (UUID)

**body:**
```json
{
  "status": "inactive"
}
```

`status` aceita: `"active"` | `"inactive"`.

**response 200:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "status": "inactive"
}
```

**response 404:**
```json
{ "error": { "code": "NOT_FOUND", "message": "usuário não encontrado" } }
```

**consumido por:**
- `UsersPage` — botão de ativar/desativar

---

#### `DELETE /api/admin/users/:id`

soft-delete de usuário (seta `deleted_at`).

**roles autorizados:** `admin` apenas

**path params:**
- `id` (UUID)

**response 204:** sem body

**response 403:**
```json
{ "error": { "code": "FORBIDDEN", "message": "apenas administradores podem excluir usuários" } }
```

**consumido por:**
- futura ação de exclusão em `UsersPage`

---

#### `GET /api/admin/users/:id/schedules`

retorna os schedules de um motorista agrupados por rota. usado pelo modal de agenda do motorista.

**roles autorizados:** `admin`, `cooperative` (apenas motoristas da própria cooperativa)

**path params:**
- `id` (UUID) — ID do usuário com `role=driver`

**response 200:**
```json
{
  "driver_id": "uuid",
  "driver_name": "João Silva",
  "cooperative_name": "São Benedito",
  "schedules_by_route": [
    {
      "route_id": "uuid",
      "route_name": "Fortaleza → Sobral (direto)",
      "origin": "Fortaleza",
      "destination": "Sobral",
      "schedules": [
        {
          "id": "uuid",
          "day_of_week": "seg",
          "departure_time": "06:00",
          "status": "active"
        }
      ]
    }
  ],
  "total": 8
}
```

**response 404:**
```json
{ "error": { "code": "NOT_FOUND", "message": "motorista não encontrado" } }
```

**response 422:**
```json
{ "error": { "code": "NOT_A_DRIVER", "message": "usuário não é motorista" } }
```

**consumido por:**
- `DriverSchedulesModal` — `UsersPage`

---

### 3.3 Schedules (admin)

#### `GET /api/admin/schedules`

lista schedules no formato administrativo (agrupado por rota com `AdminRoute` / `AdminSchedule`). inclui exceções e schedules temporários.

**roles autorizados:** `admin`, `cooperative` (escopo próprio), `driver` (apenas suas rotas)

**regra de escopo:**
- `admin`: vê todos
- `cooperative`: filtra por `routes.cooperative_id = user.cooperative_id`
- `driver`: filtra por `routes.drive_id = user.id`

**query params:**
- `search` (string, opcional) — busca por código ou cidades
- `cooperative_id` (UUID, opcional) — apenas admin pode filtrar por cooperativa arbitrária
- `status` (string, opcional) — `active` | `cancelled` | `suspended`
- `day_of_week` (string, opcional) — `seg` | `ter` | ... | `dom`
- `date` (string `YYYY-MM-DD`, opcional) — filtra schedules ativos para aquela data
- `page` (integer, default `0`)
- `limit` (integer, default `20`)

**response 200:**
```json
{
  "routes": [
    {
      "id": "uuid",
      "code": "R-204",
      "cooperative_name": "São Benedito",
      "origin": "Fortaleza",
      "destination": "Sobral",
      "active_days": ["seg", "ter", "qua", "qui", "sex"],
      "base_price": 28.50,
      "open_exceptions_count": 2,
      "next_exception_date": "2026-07-05",
      "stops": [
        { "city": "Fortaleza", "time": "06:00" },
        { "city": "Sobral", "time": "09:30" }
      ],
      "schedules": [
        {
          "id": "uuid",
          "departure_time": "06:00",
          "day_of_week": "seg",
          "active_days": ["seg", "ter", "qua"],
          "cooperative_name": "São Benedito",
          "origin": "Fortaleza",
          "destination": "Sobral",
          "route_code": "R-204",
          "record_status": "active",
          "operational_status": "in_operation",
          "notes": null,
          "next_exception": null,
          "rating": { "average": 4.2, "total": 120 }
        }
      ],
      "temporary_schedules": []
    }
  ],
  "summary": {
    "total_routes": 48,
    "total_schedules": 312,
    "cancelled_today": 3,
    "delayed_today": 7
  },
  "meta": {
    "page": 0,
    "per_page": 20,
    "total": 48
  }
}
```

**consumido por:**
- `SchedulesPage` (`/admin/schedules`, `/cooperative/schedules`, `/driver/my-schedules`)

---

#### `POST /api/admin/schedules`

cria um novo schedule vinculado a uma rota existente.

**roles autorizados:** `admin`, `cooperative` (apenas nas próprias rotas)

**body:**
```json
{
  "route_id": "uuid",
  "departure_time": "14:00",
  "day_of_week": "seg",
  "notes": null
}
```

validação: `route_id` deve existir e (para `cooperative`) pertencer à sua cooperativa.

**response 201:**
```json
{
  "id": "uuid",
  "route_id": "uuid",
  "departure_time": "14:00",
  "day_of_week": "seg",
  "status": "active",
  "notes": null
}
```

**consumido por:**
- `SchedulesPage` — modal de novo schedule

---

#### `PATCH /api/admin/schedules/:id/status`

altera o status de um schedule (active / cancelled / suspended).

**roles autorizados:** `admin`, `cooperative`

**path params:**
- `id` (UUID)

**body:**
```json
{
  "status": "suspended"
}
```

**response 200:** schedule atualizado

**consumido por:**
- `ScheduleStatusModal` — `SchedulesPage`

---

#### `POST /api/admin/schedules-exceptions`

cria uma exceção para uma ocorrência específica de um schedule (cancelamento pontual, suspensão, reagendamento).

**roles autorizados:** `admin`, `cooperative`

**body:**
```json
{
  "schedule_id": "uuid",
  "exception_date": "2026-07-04",
  "type": "cancelled",
  "reason": "feriado municipal",
  "new_departure_time": null
}
```

validação: `new_departure_time` é obrigatório quando `type = "rescheduled"`.

**response 201:**
```json
{
  "id": "uuid",
  "schedule_id": "uuid",
  "exception_date": "2026-07-04",
  "type": "cancelled",
  "reason": "feriado municipal",
  "new_departure_time": null,
  "created_at": "2026-07-03T10:00:00Z"
}
```

**consumido por:**
- `ExceptionModal` — `SchedulesPage`

---

#### `POST /api/admin/schedules-temporary`

cria um horário temporário (extra, fora da grade recorrente).

**roles autorizados:** `admin`, `cooperative`

**body:**
```json
{
  "route_id": "uuid",
  "departure_time": "22:00",
  "date": "2026-07-10",
  "reason": "horário extra de São João",
  "status": "active"
}
```

**response 201:**
```json
{
  "id": "uuid",
  "route_id": "uuid",
  "departure_time": "22:00",
  "date": "2026-07-10",
  "reason": "horário extra de São João",
  "status": "active",
  "created_at": "2026-07-03T10:00:00Z"
}
```

**consumido por:**
- `ExceptionModal` — quando tipo é "temporário"

---

### 3.4 Rotas (admin)

#### `GET /api/admin/routes`

lista rotas com filtros. o shape é simplificado (sem schedules aninhados) — diferente de `GET /api/admin/schedules` que agrupa schedules dentro das rotas.

**roles autorizados:** `admin`, `cooperative` (escopo próprio), `driver` (apenas suas rotas)

**query params:**
- `search` (string, opcional)
- `cooperative_id` (UUID, opcional) — apenas admin
- `status` (string, opcional) — `active` | `inactive` | `suspended`
- `origin` (string, opcional)
- `destination` (string, opcional)
- `page` (integer, default `0`)
- `limit` (integer, default `20`)

**response 200:**
```json
{
  "routes": [
    {
      "id": "uuid",
      "name": "Fortaleza → Sobral (direto)",
      "code": "R-204",
      "origin": "Fortaleza",
      "destination": "Sobral",
      "cooperative_name": "São Benedito",
      "price": 28.50,
      "active_days": ["seg", "ter", "qua", "qui", "sex"],
      "status": "active",
      "schedules_count": 5,
      "driver_name": "João Silva"
    }
  ],
  "meta": { "page": 0, "per_page": 20, "total": 892 }
}
```

**consumido por:**
- `RoutesPage` — `/admin/routes`, `/cooperative/routes`, `/driver/my-routes`

---

#### `GET /api/admin/routes/:id`

detalhe de uma rota no contexto admin (com stops, schedules, temporários).

**roles autorizados:** `admin`, `cooperative`, `driver`

**response 200:** mesmo shape de `GET /api/routes/:id` porém com schedules completos aninhados e campo `driver`.

**consumido por:**
- `RoutesPage` — painel de detalhes ao expandir uma rota

---

#### `POST /api/admin/routes`

cria uma nova rota.

**roles autorizados:** `admin`, `cooperative`

**body:**
```json
{
  "name": "Fortaleza → Sobral (direto)",
  "cooperative_id": "uuid",
  "origin_city_id": "uuid",
  "destination_city_id": "uuid",
  "price": 28.50,
  "active_days": ["seg", "ter", "qua", "qui", "sex"],
  "drive_id": "uuid",
  "stops": [
    { "city_id": "uuid", "position": 1, "departure_time": "06:00", "estimated_duration": "00:00:00" }
  ]
}
```

**response 201:** rota criada

**pendência:** `origin_city_id` e `destination_city_id` não existem explicitamente no schema atual de `routes`. ver [Seção 5](#5-alterações-necessárias-no-schema).

**consumido por:**
- `RoutesPage` — modal de nova rota

---

#### `PUT /api/admin/routes/:id`

atualiza uma rota existente.

**roles autorizados:** `admin`, `cooperative` (apenas suas rotas)

**body:** mesmos campos do POST, todos opcionais

**response 200:** rota atualizada

**consumido por:**
- `RoutesPage` — modal de edição

---

#### `PATCH /api/admin/routes/:id/status`

altera status de uma rota.

**roles autorizados:** `admin`, `cooperative`

**body:**
```json
{ "status": "suspended" }
```

**response 200:** rota atualizada

**consumido por:**
- `RoutesPage` — ação de suspender/reativar rota

---

#### `DELETE /api/admin/routes/:id`

soft-delete de rota.

**roles autorizados:** `admin` apenas

**response 204:** sem body

**consumido por:**
- `RoutesPage` — ação de exclusão

---

### 3.5 Cooperativas (admin)

#### `GET /api/admin/cooperatives`

lista cooperativas no contexto admin.

**roles autorizados:** `admin` (lista completa); `cooperative` (retorna apenas a própria cooperativa)

**query params:**
- `search` (string, opcional)
- `status` (string, opcional) — futuro (não existe no schema atual)
- `page` (integer, default `0`)
- `limit` (integer, default `20`)

**response 200:** mesmo shape de `GET /api/cooperatives` com campos extras admin: total de motoristas, total de rotas ativas

**consumido por:**
- `/admin/cooperatives`
- `CooperativePicker` — em formulários de criação/edição de usuários e rotas

---

#### `POST /api/admin/cooperatives`

cria uma nova cooperativa.

**roles autorizados:** `admin`

**body:**
```json
{
  "name": "Nova Cooperativa",
  "phone_number": "+55 85 3000-0000",
  "logo_url": null,
  "site": "www.novacooperativa.com.br",
  "brand_color": "#123456"
}
```

**response 201:** cooperativa criada

**consumido por:**
- `/admin/cooperatives` — modal de nova cooperativa

---

#### `PUT /api/admin/cooperatives/:id`

atualiza uma cooperativa.

**roles autorizados:** `admin`, `cooperative` (apenas a própria)

**body:** mesmos campos do POST, opcionais

**response 200:** cooperativa atualizada

**consumido por:**
- `/admin/cooperatives` e `/cooperative/my-cooperative`

---

#### `DELETE /api/admin/cooperatives/:id`

soft-delete de cooperativa.

**roles autorizados:** `admin` apenas

**response 204:** sem body

---

### 3.6 Cidades (admin)

#### `GET /api/admin/cities`

lista cidades no contexto admin.

**roles autorizados:** `admin`

**query params:**
- `search` (string, opcional)
- `page` (integer, default `0`)
- `limit` (integer, default `20`)

**response 200:**
```json
{
  "cities": [
    { "id": "uuid", "name": "Fortaleza", "state": "CE", "route_count": 24, "deleted_at": null }
  ],
  "meta": { "page": 0, "per_page": 20, "total": 7 }
}
```

**consumido por:**
- `/admin/cities`

---

#### `POST /api/admin/cities`

cria uma nova cidade.

**roles autorizados:** `admin`

**body:**
```json
{
  "name": "Tianguá",
  "state": "CE"
}
```

validação: `(name, state)` deve ser único (não duplicar cidade existente).

**response 201:**
```json
{ "id": "uuid", "name": "Tianguá", "state": "CE" }
```

**response 409:**
```json
{ "error": { "code": "CITY_CONFLICT", "message": "cidade já cadastrada" } }
```

**consumido por:**
- `/admin/cities`

---

#### `PUT /api/admin/cities/:id`

atualiza nome ou estado de uma cidade.

**roles autorizados:** `admin`

**body:** `name` e/ou `state`, opcionais

**response 200:** cidade atualizada

---

#### `DELETE /api/admin/cities/:id`

soft-delete de cidade.

**roles autorizados:** `admin`

**response 204:** sem body

**response 422:**
```json
{ "error": { "code": "CITY_IN_USE", "message": "cidade vinculada a rotas ativas — remova as rotas antes" } }
```

---

### 3.7 Atrasos (admin)

#### `GET /api/admin/delays`

lista atrasos registrados com filtros.

**roles autorizados:** `admin`, `cooperative` (escopo próprio), `driver` (apenas os que reportou)

**query params:**
- `route_id` (UUID, opcional)
- `schedule_id` (UUID, opcional)
- `severity` (string, opcional) — `low` | `medium` | `high`
- `date_from` (string `YYYY-MM-DD`, opcional)
- `date_to` (string `YYYY-MM-DD`, opcional)
- `page` (integer, default `0`)
- `limit` (integer, default `20`)

**response 200:**
```json
{
  "delays": [
    {
      "id": "uuid",
      "schedule_id": "uuid",
      "route_id": "uuid",
      "route_origin": "Fortaleza",
      "route_destination": "Sobral",
      "delay_minutes": 15,
      "severity": "medium",
      "reason": "congestionamento na BR-222",
      "reported_by_name": "João Silva",
      "date": "2026-07-03T14:15:00Z",
      "created_at": "2026-07-03T14:20:00Z"
    }
  ],
  "meta": { "page": 0, "per_page": 20, "total": 42 }
}
```

**consumido por:**
- `/admin/delays`, `/cooperative/delays`

---

#### `POST /api/admin/delays`

registra um atraso. atrasos não se editam após criação.

**roles autorizados:** `admin`, `cooperative`, `driver`

**body:**
```json
{
  "schedule_id": "uuid",
  "route_id": "uuid",
  "delay_minutes": 15,
  "reason": "congestionamento na BR-222",
  "severity": "medium"
}
```

`severity` pode ser calculado automaticamente pelo backend com base em `delay_minutes` (low: <15, medium: 15–30, high: >30), mas aceitar override do client.

**response 201:** delay criado

**consumido por:**
- `DelayModal` — `SchedulesPage`
- `/driver/report-delay`

---

### 3.8 Dashboard

#### `GET /api/admin/dashboard/stats`

KPIs globais do sistema. apenas role `admin`.

**roles autorizados:** `admin`

**response 200:**
```json
{
  "active_cooperatives": 48,
  "registered_routes": 892,
  "today_schedules": 3405,
  "delays_24h": 14,
  "average_rating": 4.6,
  "pending_exceptions": 23,
  "new_routes_30d": 18
}
```

**consumido por:**
- `/admin/dashboard`

---

#### `GET /api/admin/dashboard/cooperative-stats`

KPIs da cooperativa logada.

**roles autorizados:** `cooperative`

**response 200:**
```json
{
  "cooperative_id": "uuid",
  "cooperative_name": "São Benedito",
  "active_routes": 12,
  "today_schedules": 87,
  "active_drivers": 8,
  "delays_24h": 2,
  "average_rating": 4.2,
  "pending_exceptions": 3
}
```

**consumido por:**
- `/cooperative/dashboard`

---

#### `GET /api/admin/dashboard/driver-schedule`

agenda do motorista logado para hoje.

**roles autorizados:** `driver`

**response 200:**
```json
{
  "driver_id": "uuid",
  "driver_name": "João Silva",
  "today": "2026-07-03",
  "schedules": [
    {
      "schedule_id": "uuid",
      "route_name": "Fortaleza → Sobral (direto)",
      "origin": "Fortaleza",
      "destination": "Sobral",
      "departure_time": "06:00",
      "status": "active",
      "exception": null
    }
  ]
}
```

**consumido por:**
- `/driver/dashboard`, `/driver/my-schedules`

---

## 4. Mapa de consumo

| página / componente | endpoints consumidos | notas |
|---|---|---|
| `/` (home) | `GET /api/destinations/summary?cities=Sobral,...` | 6 destinos curados estáticos no frontend; ipinfo.io externo pra detecção de cidade |
| `/` → `PartnerCoopsSection` | `GET /api/cooperatives?limit=3&sort=route_count:desc` | hoje MOCK_COOPERATIVES hardcoded |
| `/` → `HomeFeedSection` — favoritos | `GET /api/schedules?ids=...` | IDs vêm de `localStorage.vanhora_favorites`; agrupamento no client |
| `/` → `HomeFeedSection` — recentes | nenhum endpoint | buscas recentes são localStorage apenas |
| `/` → `LocationBanner` | ipinfo.io (externo) + `GET /api/cities` | geolocation-api.ts já implementa; `GET /api/cities` resolve nome→UUID |
| `/schedules` — listagem | `GET /api/schedules` | `useGroupedSchedules` com `limit=9999`; agrupamento/sort no client |
| `/schedules` — paginação | `GET /api/schedules` | `useSchedules` com limit=12 e infinite scroll |
| `/schedules` → `ScheduleDialog` | `GET /api/schedules/:id` | queryKey `['schedule', scheduleId]` |
| `/schedules` → rating check | `GET /api/ratings/check/:scheduleId` | queryKey `['rating-check', scheduleId]`; X-Session-Id header |
| `/schedules` → rating submit | `POST /api/ratings` | mutation; invalida `rating-check` e `schedule` queries |
| `/favorites` | nenhum endpoint externo | `getMockSchedules()` filtrado por localStorage; quando backend: `GET /api/schedules?ids=...` |
| `/about` → cidades | `GET /api/cities/served` | hoje hardcoded "Fortaleza, Sobral..." |
| `/author` | nenhum | conteúdo estático |
| `/sign-in` | `POST /api/auth/login` | redireciona por role após login |
| `/admin/dashboard` | `GET /api/admin/dashboard/stats` | hoje hardcoded |
| `/admin/cooperatives` | `GET /api/admin/cooperatives` + `POST`, `PUT :id`, `DELETE :id` | |
| `/admin/cities` | `GET /api/admin/cities` + `POST`, `PUT :id`, `DELETE :id` | |
| `/admin/routes` | `GET /api/admin/routes` + `POST`, `PUT :id`, `PATCH :id/status`, `DELETE :id` | |
| `/admin/schedules` | `GET /api/admin/schedules` + `POST`, `PATCH :id/status` | inclui `POST /api/admin/schedules-exceptions` e `POST /api/admin/schedules-temporary` |
| `/admin/delays` | `GET /api/admin/delays` + `POST /api/admin/delays` | |
| `/admin/users` | `GET /api/admin/users` + `POST`, `PUT :id`, `PATCH :id/status` + `GET :id/schedules` (driver) | |
| `/cooperative/dashboard` | `GET /api/admin/dashboard/cooperative-stats` | escopo restrito à própria cooperativa |
| `/cooperative/my-cooperative` | `GET /api/admin/cooperatives/:id` + `PUT :id` | edição da própria cooperativa |
| `/cooperative/routes` | `GET /api/admin/routes` (escopo próprio) + CRUD | |
| `/cooperative/schedules` | `GET /api/admin/schedules` (escopo próprio) + modais | |
| `/cooperative/users` | `GET /api/admin/users` (escopo próprio) + criação de drivers | |
| `/cooperative/delays` | `GET /api/admin/delays` (escopo próprio) + `POST` | |
| `/driver/dashboard` | `GET /api/admin/dashboard/driver-schedule` | |
| `/driver/my-routes` | `GET /api/admin/routes` (escopo driver) | apenas rotas onde `drive_id = user.id` |
| `/driver/my-schedules` | `GET /api/admin/schedules` (escopo driver) | |
| `/driver/report-delay` | `POST /api/admin/delays` | |
| `GET /api/auth/me` | todos os portais após login | verifica token e retorna contexto de role |

---

## 5. Alterações necessárias no schema

campos e tabelas que os endpoints precisam mas `database.md` atual não tem ou tem inconsistências.

---

**1. `cooperatives.brand_color` (varchar 7)**

- endpoint que precisa: `GET /api/cooperatives`, `GET /api/destinations/summary`, `GET /api/admin/cooperatives`
- tipo: `varchar(7)` — hex color como `#185FA5`
- constraint: deve ser hex válido; nullable (cooperativa sem cor cai no fallback do frontend)
- hoje: mapa hardcoded `COOPERATIVE_COLORS` em `src/lib/utils/schedule-status.ts`
- impacto: additive, sem breaking

---

**2. `routes.origin_city_id` e `routes.destination_city_id` (uuid fk)**

- endpoint que precisa: todo endpoint que retorna rota com origem/destino como objetos `{ id, name, state }`
- tipo: `uuid NOT NULL REFERENCES cities(id)`
- o schema atual tem `routes` mencionando cidades apenas no relacionamento "cities -> routes (origin and destination)" mas não define os campos FK explicitamente na tabela
- hoje: `origin` e `destination` em `mock-routes.ts` são strings de cidade; `MOCK_ROUTES` não tem city_id
- impacto: breaking — requer migration e seeds atualizados

---

**3. `routes.name` — clareza de uso**

- o schema tem `routes.name` mas o frontend mostra `"Fortaleza → Sobral (direto)"` como nome legível
- hoje `MOCK_ROUTES` usa nomes internos como `"Expresso Norte"` (não concatenações de cidades)
- decisão necessária: manter `name` como nome editorial da rota (ex: "Expresso Norte"), ou concatenar `origin_city.name → destination_city.name` no backend, ou adicionar campo `display_name`
- recomendação: manter `name` como campo editorial livre, e o backend monta o display a partir das cidades quando necessário

---

**4. `routes.drive_id` — typo no schema**

- schema atual tem `drive_id` (sem 'r')
- mock-routes.ts usa `driver_id`
- decisão: padronizar para `driver_id` no banco; requer migration

---

**5. `cooperatives.brand_color`, `rating`, `rating_count`, `route_count` — campos derivados vs. armazenados**

- `rating` e `rating_count`: são agregações sobre `ratings` (que hoje está vinculado a `schedule_id`, não a `cooperative_id`)
- o frontend exibe rating por cooperativa — o backend precisa agregar via join: `cooperatives → routes → schedules → ratings`
- recomendação: materializar em `cooperatives.rating_cached` e `cooperatives.rating_count_cached`, atualizados por trigger ou job após cada insert em `ratings`
- `route_count`: count de `routes` com `status=active` por cooperativa; pode ser calculado on-demand com índice ou materializado
- impacto: additive

---

**6. `ratings` vinculados a `schedule_id` mas frontend agrega por cooperativa**

- a tabela `ratings` usa `schedule_id` como FK (correto — avaliação é por viagem específica)
- o frontend hoje exibe `cooperativeRating` e `cooperativeReviews` no `ScheduleCard`
- esses campos precisam ser calculados como média ponderada de todos os ratings dos schedules daquela cooperativa
- recomendação: materializar em `cooperatives.rating_cached` como descrito acima

---

**7. `schedules` — campos ausentes para o `ScheduleDialog`**

os campos abaixo são consumidos pelo dialog mas não existem no schema:

| campo | entidade | tipo sugerido |
|---|---|---|
| `description` | `routes` ou `schedules` | `text nullable` |
| `contact.email` | `cooperatives` | `varchar nullable` |
| `operating_days` | derivado de `routes.active_days` | sem campo novo; mapeamento no backend |

`operating_days` em pt-BR é apenas `routes.active_days` mapeado (`seg` → `Segunda`); não precisa de campo novo.

`description`: adicionar em `routes` como descrição editorial da rota.
`contact.email`: adicionar em `cooperatives`.

---

**8. `cities.photo_url` — campo futuro**

- `DestinationCard` tem prop `photoUrl?: string` preparada para fotos das cidades
- hoje sempre `undefined`; gradient placeholder é exibido
- adicionar `cities.photo_url varchar nullable` quando imagens estiverem disponíveis
- impacto: additive; nenhuma alteração de comportamento atual

---

**9. `schedules_exceptions` → `schedule_id` na `ratings`**

- `ratings.date_ata` — typo? provavelmente deveria ser `created_at` (timestamp)
- decisão: renomear para `created_at` no schema; requer migration simples

---

**10. `delays.severity` — calculado vs. enviado**

- frontend envia `severity` no body de `POST /api/admin/delays`
- o backend pode ignorar o valor enviado e calcular: `low` < 15min, `medium` 15-30, `high` > 30
- recomendação: calcular no backend baseado em `delay_minutes`; ignorar campo enviado pelo client (evita inconsistência)

---

## 6. Considerações de performance

**`GET /api/schedules` — query pesada**

o join de `schedules → routes → cities` (2 cidades) + `schedules → routes → cooperatives` + `schedules_exceptions` pode ser caro sem índices adequados.

índices recomendados além dos já definidos:
```sql
-- busca por cidade origem/destino
CREATE INDEX idx_routes_origin_dest ON routes(origin_city_id, destination_city_id);

-- filtro de schedules por rota
-- já existe: idx_schedules_route ON schedules(route_id)

-- exceções por data
CREATE INDEX idx_exceptions_date ON schedules_exceptions(exception_date);
CREATE INDEX idx_exceptions_schedule ON schedules_exceptions(schedule_id, exception_date);
```

---

**`cooperative_rating` — agregação custosa**

calcular `avg(stars)` join por `schedules` de uma cooperativa a cada request é O(n) no número de ratings. com 10k+ avaliações, pode ficar lento.

recomendação: materializar em `cooperatives.rating_cached DECIMAL(3,2)` e `cooperatives.rating_count_cached INTEGER`, atualizados por trigger em `INSERT/UPDATE` na tabela `ratings`.

```sql
-- após cada insert/update em ratings:
UPDATE cooperatives
SET
  rating_cached = (
    SELECT AVG(r.stars)
    FROM ratings r
    JOIN schedules s ON s.id = r.schedule_id
    JOIN routes ro ON ro.id = s.route_id
    WHERE ro.cooperative_id = cooperatives.id
  ),
  rating_count_cached = (
    SELECT COUNT(*)
    FROM ratings r
    JOIN schedules s ON s.id = r.schedule_id
    JOIN routes ro ON ro.id = s.route_id
    WHERE ro.cooperative_id = cooperatives.id
  )
WHERE cooperatives.id = NEW.cooperative_id; -- via join path
```

---

**`GET /api/routes/:id/statistics` — agregação de 30 dias**

agrupa `delays` e `schedules_exceptions` dos últimos 30 dias. com volume alto pode ser lento.

recomendação: cache de resultado por `(route_id, date)` com TTL de 1 hora. não precisa ser em tempo real — estatísticas de ontem são suficientemente recentes.

---

**`GET /api/destinations/summary` — multi-city query**

recebe até 6-10 cidades e faz a query de contagem + min price para cada. pode ser batch ou uma única query com `GROUP BY`.

recomendação: fazer em query única:
```sql
SELECT
  c.id, c.name, c.state,
  COUNT(DISTINCT s.id) as schedule_count,
  MIN(ro.price) as price_from
FROM cities c
JOIN routes ro ON ro.destination_city_id = c.id
JOIN schedules s ON s.route_id = ro.id
WHERE c.name = ANY($1)  -- array de nomes
  AND s.day_of_week = $2  -- dia da semana derivado da data
  AND s.status = 'active'
  AND ro.status = 'active'
GROUP BY c.id, c.name, c.state
```

---

**paginação de admin schedules com dados aninhados**

`GET /api/admin/schedules` retorna rotas com schedules, exceptions e temporários aninhados. paginar no nível de rotas (não de schedules individuais) é a abordagem correta — evita duplicação de dados de rota no response.

limite razoável: 20 rotas por página, cada uma com até ~10 schedules (response de ~200 objetos). evitar retornar todas as rotas sem paginação.
