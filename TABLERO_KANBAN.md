# Tablero Kanban - Cafe Campus

Flujo de columnas en GitHub Projects:

`Backlog` -> `Por hacer` -> `En progreso` -> `En revision` -> `Hecho`

Cada tarjeta se trabaja en su rama (`feat/…`, `chore/…`, `docs/…`) y se integra a `main`
por **Pull Request revisado por otro integrante** (GitHub Flow). El reparto detallado y la
propiedad por directorio estan en
[`docs/planificacion-avance1/01-roles-y-kanban.md`](docs/planificacion-avance1/01-roles-y-kanban.md)
y el orden de commits en
[`docs/planificacion-avance1/02-plan-de-commits.md`](docs/planificacion-avance1/02-plan-de-commits.md).

**Responsables:** **M** = Marcos Escobar · **T** = Mateo Sosa · **S** = Stefany Diaz.

## Avance 1 — Acoplamiento temporal y latencia (`v1-avance1`)

| Estado | Tarjeta | Resp. | Rama |
|---|---|---|---|
| [x] | Definir dominio del MVP: cafeteria universitaria (3 MS + Gateway) | Todos (M coordina) | — |
| [x] | Inicializar repositorio y proteger `main` | M | commit inicial en `main` |
| [x] | Docker Compose base (Gateway + 3 MS + Redis + Postgres) | M | `chore/setup-monorepo` |
| [x] | Script `benchmark.js` de medicion de latencia | M | `chore/setup-monorepo` |
| [x] | MS Productos — catalogo (CRUD + persistencia Prisma) | S | `feat/ms-productos` |
| [x] | MS Inventario — stock (CRUD + persistencia Prisma) | T | `feat/ms-inventario` |
| [x] | MS Pedidos — pedidos (CRUD + validacion de stock por HTTP) | T | `feat/ms-pedidos` |
| [x] | API Gateway — entrada HTTP + proxies + JWT/Guards | M | `feat/gateway` |
| [x] | Camino sincrono TCP (cadena Gateway->Pedidos->Inventario) | T (handlers) + M (cliente) | `feat/ms-inventario`, `feat/ms-pedidos`, `feat/gateway` |
| [x] | Camino asincrono Redis (evento, emisor no bloquea) | T (consumidor) + M (publisher) | `feat/ms-inventario`, `feat/gateway` |
| [x] | Manejo de excepciones en la capa de servicios | cada duenio en su servicio | ramas `feat/*` |
| [x] | Benchmark de latencia (prom/p95/max) + evidencia en `/docs` | S | `docs/avance1` |
| [x] | Prueba de caida de MS downstream (acoplamiento temporal) | S | `docs/avance1` |
| [x] | Diagrama de arquitectura v1 + README Avance 1 | S | `docs/avance1` |
| [ ] | Crear tag `v1-avance1` | M (release) | directo en `main` |

## Avance 2 — gRPC + 2.º transporte + excepciones (`v2-avance2`)

| Estado | Tarjeta | Resp. | Rama |
|---|---|---|---|
| [ ] | Definir contrato gRPC (`.proto`) entre dos microservicios | — | `feat/grpc` |
| [ ] | Agregar segundo transporte asincrono (RabbitMQ/MQTT/NATS) | — | `feat/transporte-2` |
| [ ] | Tabla comparativa de transportes + manejo de excepciones | — | `docs/avance2` |
| [ ] | Crear tag `v2-avance2` | — | directo en `main` |

## Avance 3 — Seguridad, observabilidad e integracion (`v3-final`)

| Estado | Tarjeta | Resp. | Rama |
|---|---|---|---|
| [x] | Login JWT base en Gateway (mock in-memory) | M | `feat/gateway` (Avance 1) |
| [x] | Guards por rol en Gateway | M | `feat/gateway` (Avance 1) |
| [ ] | Login real que emite JWT (200 con token / 401 / 403) | — | `feat/auth` |
| [ ] | Integrar observabilidad (Sentry) | — | `feat/observabilidad` |
| [ ] | Integracion final + seccion de defensa | — | `docs/avance3` |
| [ ] | Crear tag `v3-final` | — | directo en `main` |

## Estado del tablero al cierre del Avance 1

| Backlog | Por hacer | En progreso | En revision | Hecho |
|---|---|---|---|---|
| Avance 2: gRPC | — | — | — | Fundacion monorepo |
| Avance 2: 2.º transporte | — | — | — | MS Productos |
| Avance 3: JWT+Guard real | — | — | — | MS Inventario (TCP+Redis) |
| Avance 3: Sentry | — | — | — | MS Pedidos (TCP) |
| — | — | — | — | API Gateway |
| — | — | — | — | Benchmark + evidencia |
| — | — | — | — | README + diagrama + tag |

> Al cerrar el corte se sube una captura de este tablero a `docs/avance1-kanban.png`
> y se enlaza en el README (lo hace Stefany en `docs/avance1`).
