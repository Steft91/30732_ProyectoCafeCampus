# Patrones y principios de diseño aplicados — Avance 2 (criterio C4)

Se distingue lo que **aporta NestJS "gratis"** (por convención del framework) de lo que
**diseñó el equipo** deliberadamente en este avance. Cada punto cita el archivo donde se evidencia.
Los patrones del Avance 1 (API Gateway, Proxy HTTP, DTO+Validación, IoC/DI, Pub/Sub Redis) se
conservan; aquí se listan **los que aporta el Avance 2**.

## Patrones de diseño (nuevos en Avance 2)

| Patrón | ¿Framework o equipo? | Dónde se evidencia | Qué resuelve |
|---|---|---|---|
| **RPC con contrato (gRPC)** | Equipo (usando `Transport.GRPC` de `@nestjs/microservices`) | `proto/productos.proto` + `ms-productos/.../productos-grpc.controller.ts` (`@GrpcMethod`) + cliente en `ms-pedidos/.../pedidos.service.ts` (`ClientGrpc.getService`) | Comunicación síncrona **tipada por contrato** entre Pedidos y Productos; el servidor es la fuente de verdad de `nombre`/`precio`. |
| **Contrato compartido (Schema/IDL)** | Equipo | `proto/productos.proto` montado como `/proto` (read-only) en ambos contenedores | Un único `.proto` versionado define mensajes y servicio para cliente y servidor: evita duplicar tipos y desincronizarlos. |
| **Publisher/Subscriber sobre cola durable (RabbitMQ)** | Equipo (usando `Transport.RMQ`) | `ms-pedidos/.../pedidos.service.ts` (`emit('pedido.creado.rabbitmq')`) + `ms-inventario/.../pedidos-rabbitmq.controller.ts` (`@EventPattern`) | Segundo transporte asíncrono con **cola durable**: RabbitMQ desacopla la publicación del evento y su consumo. La cola se configuró
como durable, ofreciendo mayor capacidad de retención que Redis Pub/Sub y
permitiendo que el consumidor procese mensajes pendientes según la configuración
del broker y del mensaje. |
| **Snapshot / Anti-Corruption en el borde** | Equipo | `pedidos.service.ts` → `obtenerSnapshotsProductos()` construye `ItemPedidoConSnapshot` | El pedido guarda una copia (`nombre`, `precio`) tomada del servidor gRPC en el momento de crearlo; el cliente ya **no** es fuente confiable de esos datos. |
| **Traducción de errores entre transportes** | Equipo | `productos-grpc.controller.ts` (`RpcException` código `NOT_FOUND`) → `pedidos.service.ts` (`try/catch` → `HttpException 422`) | Un error del servidor gRPC se convierte en una respuesta HTTP controlada, sin propagar detalles del transporte ni tumbar el proceso. |

## Principios SOLID / de arquitectura (aplicados en Avance 2)

| Principio | Dónde | Justificación |
|---|---|---|
| **SRP (Responsabilidad Única)** | `ProductosGrpcController` separado de `ProductosController` (HTTP) | El controlador gRPC solo adapta el transporte; la lógica sigue en `ProductosService`. Un mismo servicio se expone por HTTP **y** gRPC sin duplicar reglas. |
| **Comunicación basada en contrato** | `productos.proto` y `ProductosGrpcService` | Cliente y servidor acuerdan la estructura de los mensajes y operaciones mediante el contrato `.proto`, reduciendo el acoplamiento a la implementación interna de MS Productos. |
| **Extensibilidad de transportes** | `ms-inventario/src/main.ts` y `app.module.ts` | Se incorporó RabbitMQ conservando los caminos TCP y Redis del Avance 1, permitiendo que varios transportes convivan dentro del mismo microservicio. |
| **Manejo de excepciones en la capa de servicios** | `try/catch` en `obtenerSnapshotsProductos`, `validarStock`; `.catch()` en `publicarPedidoCreadoRabbitMQ` y `descontarStock` | El fallo de un transporte aguas abajo se captura y se responde controladamente; la publicación RabbitMQ es *best-effort* y su error se registra sin abortar el pedido ya creado. |
| **Aislamiento de fallos (resiliencia)** | Las llamadas gRPC y RabbitMQ incorporan `timeout` mediante RxJS para evitar
bloqueos indefinidos. Las llamadas HTTP a Inventario cuentan con manejo de
errores mediante `try/catch` o `.catch()`. | Ninguna dependencia lenta bloquea indefinidamente al servicio llamante. |

## Síntesis de decisiones de diseño

- Lo que **NestJS proporciona mediante el framework**: los transportes `Transport.GRPC` y
  `Transport.RMQ` de `@nestjs/microservices`, los decoradores `@GrpcMethod`/`@EventPattern`,
  `ClientProxyFactory`/`ClientGrpc`, la jerarquía de excepciones (`RpcException`, `HttpException`)
  e IoC/DI.

- Lo que **fue definido por el equipo**: el contrato `productos.proto` y su montaje compartido,
  la decisión de que **Pedidos consulte a Productos por gRPC** para tomar datos reales del servidor
  (patrón snapshot), la elección de **RabbitMQ con cola durable** como segundo transporte por su
  garantía de entrega frente a Redis, y la **traducción de errores gRPC → HTTP 422** como estrategia
  consistente de manejo de excepciones que evita la caída del servicio.
