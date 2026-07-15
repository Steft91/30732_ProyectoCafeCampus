# Roles, actividades y Kanban — Avance 1

Equipo de **3 integrantes**. El reparto utiliza **propiedad por directorio**: cada integrante trabaja principalmente sobre directorios disjuntos, reduciendo la probabilidad de conflictos durante la integración de las ramas.

## Integrantes y responsabilidades

| Integrante | Rol | Directorios/archivos propios | Ramas |
|---|---|---|---|
| **Marcos Escobar** | Arquitectura · API Gateway · Integración | commit inicial (`.gitignore`, README stub) · fundación (`docker-compose.yml`, `benchmark.js`, `TABLERO_KANBAN.md`) · `gateway/` completo | commit inicial en `main`, `chore/setup-monorepo`, `feat/gateway` |
| **Mateo Sosa** | Backend · Transportes (TCP + Redis) | `ms-pedidos/`, `ms-inventario/` | `feat/ms-inventario`, `feat/ms-pedidos` |
| **Stefany Díaz** | Persistencia · Documentación · QA · Mediciones | `ms-productos/`, `docs/`, `README.md` final | `feat/ms-productos`, `docs/avance1` |

## Reparto de tarjetas del `TABLERO_KANBAN.md` (etiqueta `avance-1`)

| Tarjeta Kanban (Avance 1) | Responsable | Rama donde se resuelve |
|---|---|---|
| Definir dominio del MVP (3 MS + Gateway) | Todos (Marcos coordina) | — (definición previa) |
| Inicializar repo (crea `main`), proteger `main` | Marcos | commit inicial en `main` |
| Docker Compose base + `benchmark.js` + tablero (Gateway + 3 MS + Redis + Postgres) | Marcos | `chore/setup-monorepo` |
| MS 1 — Catálogo (CRUD + persistencia) | Stefany | `feat/ms-productos` |
| MS 2 — Inventario (CRUD + persistencia) | Mateo | `feat/ms-inventario` |
| MS 3 — Pedidos (CRUD + persistencia) | Mateo | `feat/ms-pedidos` |
| API Gateway (entrada HTTP + proxies + JWT) | Marcos | `feat/gateway` |
| Camino síncrono con TCP (cadena Gateway→Pedidos→Inventario) | Mateo (handlers) + Marcos (cliente gateway) | `feat/ms-inventario`, `feat/ms-pedidos`, `feat/gateway` |
| Camino asíncrono con Redis (evento, emisor no bloquea) | Mateo (consumidor) + Marcos (publisher gateway) | `feat/ms-inventario`, `feat/gateway` |
| Manejo de excepciones en la capa de servicios | cada dueño en su servicio | ramas `feat/*` |
| Benchmark de latencia (prom/p95/máx) | Stefany | `docs/avance1` |
| Prueba de acoplamiento temporal (tumbar servicio) | Stefany | `docs/avance1` |
| Diagrama de arquitectura v1 + README Avance 1 | Stefany | `docs/avance1` |
| Tag `v1-avance1` | Marcos (release) | sobre `main` |

## Tablero Markdown sugerido al cierre del Avance 1

| Backlog | Por hacer | En progreso | En revisión | Hecho |
|---|---|---|---|---|
| (Avance 2: gRPC) | — | — | — | Fundación monorepo |
| (Avance 2: 2.º transporte) | — | — | — | MS Productos |
| (Avance 3: JWT+Guard real) | — | — | — | MS Inventario (TCP+Redis) |
| (Avance 3: Sentry) | — | — | — | MS Pedidos (TCP) |
| — | — | — | — | API Gateway |
| — | — | — | — | Benchmark + evidencia |
| — | — | — | — | README + diagrama + tag |

> Al cerrar el corte se sube una captura del tablero a `docs/avance1-kanban.png`
> y se enlaza en el README (lo hace Stefany en `docs/avance1`).

## Cómo se conecta con GitHub Flow

- `main` protegida; cada tarjeta se trabaja en su rama `feat/…`, `chore/…`, `docs/…`.
- Cada rama se integra a `main` mediante **Pull Request**, manteniendo separado el trabajo realizado en `feat/…`, `chore/…` y `docs/…`.
- Un **tag por avance**: `v1-avance1` tras fusionar todo.
