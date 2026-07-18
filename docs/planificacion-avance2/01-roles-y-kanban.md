# Roles, actividades y Kanban — Avance 2

Equipo de **3 integrantes**. Se mantiene la **propiedad por directorio** del Avance 1: cada integrante
trabaja principalmente sobre directorios disjuntos, reduciendo la probabilidad de conflictos durante
la integración de las ramas. El único archivo compartido (`docker-compose.yml`) y el **contrato
`.proto`** los fija Marcos en la fase de fundación del avance, y nadie más los toca en paralelo.

## Integrantes y responsabilidades

| Integrante | Rol | Directorios/archivos propios | Ramas |
|---|---|---|---|
| **Marcos Escobar** | Arquitectura · **gRPC (contrato + servidor)** · Infraestructura · Integración | `proto/productos.proto` · `docker-compose.yml` · `gateway/tsconfig.json` · **`ms-productos/` (servidor gRPC)** | `chore/grpc-rabbitmq-infra`, `feat/grpc-productos` |
| **Mateo Sosa** | Backend · Consumer RabbitMQ (Inventario) | `ms-inventario/` (consumer RMQ) | `feat/rabbitmq-inventario` |
| **Stefany Díaz** | Cliente gRPC + Publisher RabbitMQ (Pedidos) · Documentación · QA · Evidencias | `ms-pedidos/` (cliente gRPC + publisher RMQ), `docs/`, `README.md`, `TABLERO_KANBAN.md` | `feat/grpc-rabbitmq-pedidos`, `docs/avance2` |

> **Por qué este reparto no choca:** cada directorio de servicio lo toca **un solo integrante** en la
> Fase 1 — `ms-productos/` (Marcos, servidor gRPC), `ms-pedidos/` (Stefany, cliente gRPC + publisher
> RabbitMQ) y `ms-inventario/` (Mateo, consumer RabbitMQ). Las dependencias entre servicios
> (cliente↔servidor gRPC, publisher↔consumer RabbitMQ) son de **runtime**, no de compilación, y el
> **contrato `.proto`** lo congela Marcos en la Fase 0 antes de que arranquen las ramas de servicio,
> por lo que las tres ramas se fusionan en cualquier orden sin conflictos.

> **Nota sobre el reparto (equilibrio de aportes):** los **tres** integrantes tienen aportes de **código** en la Fase 1: Marcos el servidor gRPC de `ms-productos` (coherente con ser dueño del contrato `.proto`), Stefany todo el lado Pedidos —cliente gRPC + publisher RabbitMQ— además de la documentación y evidencias (criterio C5), y Mateo el consumer RabbitMQ de `ms-inventario`. Cada rama se integra mediante Pull Request para mantener la trazabilidad de los cambios.

## Reparto de tarjetas del `TABLERO_KANBAN.md` (etiqueta `avance-2`)

| Tarjeta Kanban (Avance 2) | Responsable | Rama donde se resuelve |
|---|---|---|
| Definir contrato `productos.proto` (mensajes + servicio) | Marcos | `chore/grpc-rabbitmq-infra` |
| Agregar RabbitMQ y variables gRPC/RMQ a Docker Compose | Marcos | `chore/grpc-rabbitmq-infra` |
| Montar `/proto` (read-only) en los servicios gRPC | Marcos | `chore/grpc-rabbitmq-infra` |
| MS Productos — exponer servidor gRPC `ObtenerProducto` | Marcos | `feat/grpc-productos` |
| MS Pedidos — cliente gRPC para tomar `nombre`/`precio` reales | Stefany | `feat/grpc-rabbitmq-pedidos` |
| MS Pedidos — publisher RabbitMQ `pedido.creado.rabbitmq` | Stefany | `feat/grpc-rabbitmq-pedidos` |
| MS Inventario — consumer RabbitMQ (`@EventPattern`) | Mateo | `feat/rabbitmq-inventario` |
| Manejo de excepciones: error gRPC controlado (producto inexistente → 422) | Marcos (servidor `RpcException`) + Stefany (cliente `try/catch`) | `feat/grpc-productos`, `feat/grpc-rabbitmq-pedidos` |
| Evidencias: llamada gRPC exitosa, error controlado, evento RabbitMQ consumido | Stefany | `docs/avance2` |
| Tabla comparativa de transportes + diagrama v2 | Stefany | `docs/avance2` |
| README sección Avance 2 (contrato, flujos, excepciones) | Stefany | `docs/avance2` |
| Tag `v2-avance2` | Stefany | sobre `main`, después de integrar la documentación |

## Tablero Markdown sugerido al cierre del Avance 2

| Backlog | Por hacer | En progreso | En revisión | Hecho |
|---|---|---|---|---|
| (Avance 3: JWT+Guard real) | — | — | — | Contrato `productos.proto` |
| (Avance 3: Sentry) | — | — | — | RabbitMQ en Compose + variables |
| (Avance 3: integración total) | — | — | — | Servidor gRPC (MS Productos) |
| — | — | — | — | Cliente gRPC (MS Pedidos) |
| — | — | — | — | Publisher RabbitMQ (MS Pedidos) |
| — | — | — | — | Consumer RabbitMQ (MS Inventario) |
| — | — | — | — | Error gRPC controlado (422) |
| — | — | — | — | Evidencias + README v2 + tag |

> Al cerrar el corte se sube una captura del tablero a `docs/avance2-evidencias/` y se enlaza en el
> README (lo hace Stefany en `docs/avance2`).

## Cómo se conecta con GitHub Flow

- `main` se utiliza como rama estable de integración; cada tarjeta se trabaja en una rama independiente.
- Cada rama se integra a `main` mediante Pull Request.
- Un **tag por avance**: `v2-avance2`, creado después de integrar en `main`
  los microservicios, la documentación y las evidencias del Avance 2.