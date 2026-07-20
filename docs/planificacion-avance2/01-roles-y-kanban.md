# Roles, actividades y Kanban — Avance 2

Equipo de **3 integrantes**. Se mantiene la **propiedad por directorio** del Avance 1: cada integrante
trabaja principalmente sobre directorios disjuntos, reduciendo la probabilidad de conflictos durante
la integración de las ramas. El único archivo compartido (`docker-compose.yml`) y el **contrato
`.proto`** los fija Marcos en la fase de fundación del avance, y nadie más los toca en paralelo.

## Integrantes y responsabilidades

| Integrante         | Rol                                                                           | Directorios/archivos propios                                                                                   | Ramas                                              |
| ------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Marcos Escobar** | Arquitectura · **gRPC (contrato + servidor)** · Infraestructura · Integración | `proto/productos.proto` · `docker-compose.yml` · `gateway/tsconfig.json` · **`ms-productos/` (servidor gRPC)** | `chore/grpc-rabbitmq-infra`, `feat/grpc-productos` |
| **Mateo Sosa**     | Backend · Consumer RabbitMQ (Inventario)                                      | `ms-inventario/` (consumer RMQ)                                                                                | `feat/rabbitmq-inventario`                         |
| **Stefany Díaz**   | Cliente gRPC + Publisher RabbitMQ (Pedidos) · Documentación · QA · Evidencias | `ms-pedidos/` (cliente gRPC + publisher RMQ), `docs/`, `README.md`, `TABLERO_KANBAN.md`                        | `feat/grpc-rabbitmq-pedidos`, `docs/avance2`       |

> **Por qué este reparto no choca:** cada directorio de servicio lo toca **un solo integrante** en la
> Fase 1 — `ms-productos/` (Marcos, servidor gRPC), `ms-pedidos/` (Stefany, cliente gRPC + publisher
> RabbitMQ) y `ms-inventario/` (Mateo, consumer RabbitMQ). Las dependencias entre servicios
> (cliente↔servidor gRPC, publisher↔consumer RabbitMQ) son de **runtime**, no de compilación, y el
> **contrato `.proto`** lo congela Marcos en la Fase 0 antes de que arranquen las ramas de servicio,
> por lo que las tres ramas se fusionan en cualquier orden sin conflictos.

## Reparto de tarjetas del `TABLERO_KANBAN.md` (etiqueta `avance-2`)

| Tarjeta Kanban (Avance 2)                                                     | Responsable                                                      | Rama donde se resuelve                              |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| Definir contrato `productos.proto` (mensajes + servicio)                      | Marcos                                                           | `chore/grpc-rabbitmq-infra`                         |
| Agregar RabbitMQ y variables gRPC/RMQ a Docker Compose                        | Marcos                                                           | `chore/grpc-rabbitmq-infra`                         |
| Montar `/proto` (read-only) en los servicios gRPC                             | Marcos                                                           | `chore/grpc-rabbitmq-infra`                         |
| MS Productos — exponer servidor gRPC `ObtenerProducto`                        | Marcos                                                           | `feat/grpc-productos`                               |
| MS Pedidos — cliente gRPC para tomar `nombre`/`precio` reales                 | Stefany                                                          | `feat/grpc-rabbitmq-pedidos`                        |
| MS Pedidos — publisher RabbitMQ `pedido.creado.rabbitmq`                      | Stefany                                                          | `feat/grpc-rabbitmq-pedidos`                        |
| MS Inventario — consumer RabbitMQ (`@EventPattern`)                           | Mateo                                                            | `feat/rabbitmq-inventario`                          |
| Manejo de excepciones: error gRPC controlado (producto inexistente → 422)     | Marcos (servidor `RpcException`) + Stefany (cliente `try/catch`) | `feat/grpc-productos`, `feat/grpc-rabbitmq-pedidos` |
| Evidencias: llamada gRPC exitosa, error controlado, evento RabbitMQ consumido | Stefany                                                          | `docs/avance2`                                      |
| Tabla comparativa de transportes + diagrama v2                                | Stefany                                                          | `docs/avance2`                                      |
| README sección Avance 2 (contrato, flujos, excepciones)                       | Stefany                                                          | `docs/avance2`                                      |
| Tag `v2-avance2`                                                              | Stefany                                                          | sobre `main`, después de integrar la documentación  |

## Roles de corrección (fixer) — post-retroalimentación G3 del Avance 1

El Avance 2 ya se había cerrado con tag cuando llegó la retroalimentación del Avance 1 (16.8/20).
Como los puntos señalados (falta de `RpcExceptionFilter`, `ServiceUnavailableException` dentro de
un `@MessagePattern`, migraciones Prisma ausentes en Compose, entre otros) siguen presentes en
`main`, se abre un rol de **fixer** — el equivalente en este tablero a una tarjeta de tipo _bug
fix_ — antes de volver a etiquetar `v2-avance2`. Detalle de hallazgos y prioridades en
[`04-correcciones.md`](04-correcciones.md).

| Integrante         | Rol fixer              | Responsabilidad                                                                                                                                                           | Rama                                    |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Marcos Escobar** | Fixer · Planificación  | Documenta y sube el plan de correcciones (`04-correcciones.md`, este archivo, `05-plan-de-commits.md`) a `main`; no toca código de servicio en esta fase                  | commit directo a `main` (documentación) |
| **Stefany Díaz**   | Fixer · Implementación | Ejecuta las correcciones de código (P1–P3 de `04-correcciones.md`) sobre `ms-pedidos`, `ms-inventario` y `docker-compose.yml`; commits aún **en progreso**, no fusionados | `fix/correcciones-g3-avance1`           |

## Cómo se conecta con GitHub Flow

- `main` se utiliza como rama estable de integración; cada tarjeta se trabaja en una rama independiente.
- Cada rama se integra a `main` mediante Pull Request.
- Un **tag por avance**: `v2-avance2`, creado después de integrar en `main`
  los microservicios, la documentación y las evidencias del Avance 2. Tras la retroalimentación
  del Avance 1, el tag se **actualizará** una vez fusionada la rama `fix/correcciones-g3-avance1`
  (ver rol _fixer_ arriba).
