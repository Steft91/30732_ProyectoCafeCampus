# Tablero Kanban - Cafe Campus

Flujo de columnas en GitHub Projects:

`Backlog` -> `Por hacer` -> `En progreso` -> `En revision` -> `Hecho`

Cada tarjeta se trabaja en una rama independiente (`feat/…`, `chore/…`, `docs/…`)
y se integra a `main` mediante Pull Request, conservando la trazabilidad de los cambios. (GitHub Flow). El reparto detallado y la
propiedad por directorio estan en
[`docs/planificacion-avance1/01-roles-y-kanban.md`](docs/planificacion-avance1/01-roles-y-kanban.md)


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
| [x] | Benchmark de latencia (prom/p95/max) + evidencia en `/docs` | S | `docs/avance1-evidencias` |
| [x] | Prueba de caida de MS downstream (acoplamiento temporal) | S | `docs/avance1-evidencias` |
| [x] | Diagrama de arquitectura v1 + README Avance 1 | S | `docs/avance1-evidencias` |
| [X] | Crear tag `v1-avance1` | M (release) | directo en `main` |

## Avance 2 — gRPC + RabbitMQ + manejo de excepciones (`v2-avance2`)

| Estado | Tarjeta | Resp. | Rama |
|---|---|---|---|
| [x] | Definir contrato `productos.proto` | M | `chore/grpc-rabbitmq-infra` |
| [x] | Agregar RabbitMQ y variables gRPC/RMQ a Docker Compose | M | `chore/grpc-rabbitmq-infra` |
| [x] | Montar el contrato `.proto` en Productos y Pedidos | M | `chore/grpc-rabbitmq-infra` |
| [x] | Exponer servidor gRPC en MS Productos | M | `feat/grpc-productos` |
| [x] | Consultar Productos mediante gRPC desde MS Pedidos | S | `feat/grpc-rabbitmq-pedidos` |
| [x] | Obtener nombre y precio reales mediante gRPC | S | `feat/grpc-rabbitmq-pedidos` |
| [x] | Publicar `pedido.creado.rabbitmq` desde MS Pedidos | S | `feat/grpc-rabbitmq-pedidos` |
| [x] | Consumir el evento RabbitMQ en MS Inventario | T | `feat/rabbitmq-inventario` |
| [x] | Traducir producto inexistente de gRPC a HTTP 422 | M + S | ramas de Productos y Pedidos |
| [x] | Generar evidencias de gRPC, RabbitMQ y error controlado | S | `docs/avance2-evidencias` |
| [x] | Actualizar tabla comparativa y diagrama | S | `docs/avance2-evidencias` |
| [x] | Actualizar README y documentación | S | `docs/avance2-evidencias` |
| [ ] | Crear tag `v2-avance2` después del merge final | S | sobre `main` |

## Avance 3 — Seguridad, observabilidad e integracion (`v3-final`)

| Estado | Tarjeta | Resp. | Rama |
|---|---|---|---|
| [x] | Login JWT base en Gateway (mock in-memory) | M | `feat/gateway` (Avance 1) |
| [x] | Guards por rol en Gateway | M | `feat/gateway` (Avance 1) |
| [ ] | Login real que emite JWT (200 con token / 401 / 403) | — | `feat/auth` |
| [ ] | Integrar observabilidad (Sentry) | — | `feat/observabilidad` |
| [ ] | Integracion final + seccion de defensa | — | `docs/avance3` |
| [ ] | Crear tag `v3-final` | — | directo en `main` |

## Estado del tablero al cierre del Avance 2
| Backlog | Por hacer | En progreso | En revisión | Hecho |
|---|---|---|---|---|
| Avance 3: autenticación real | — | — | — | Contrato `.proto` |
| Avance 3: observabilidad con Sentry | — | — | — | Servidor y cliente gRPC |
| Avance 3: integración final | — | — | — | RabbitMQ publisher/consumer |
| — | — | — | — | Error gRPC controlado |
| — | — | — | — | Evidencias del Avance 2 |
| — | — | — | — | Tabla comparativa y diagrama |
| — | — | — | — | Documentación del Avance 2 |

> Para cerrar se adjunta la captura del tablero al cierre del Avance 2 en `docs/avance2-evidencias/avance2-kanban.png`.