# Comparación de transportes y manejo de excepciones — Avance 2 (criterios C2/C3)

Tras el Avance 2, Cafe Campus usa **cuatro transportes** de comunicación entre servicios. Aquí se
comparan y se documenta la estrategia de excepciones de los caminos nuevos (gRPC y RabbitMQ).

## Tabla comparativa de transportes

| Transporte | Tipo | Patrón | Persistencia | Uso en Cafe Campus |
|---|---|---|---|---|
| **TCP** | Síncrono | Petición-respuesta (RPC) | No | Benchmark encadenado Gateway→Pedidos→Inventario (Avance 1). |
| **Redis** | Asíncrono | Pub/Sub | **No** (efímero) | Evento `pedido.creado.async` del benchmark (Avance 1). |
| **gRPC** | Síncrono | RPC con **contrato `.proto`** | No | `ms-pedidos` consulta `ObtenerProducto` a `ms-productos` al crear un pedido (Avance 2). |
| **RabbitMQ** | Asíncrono | Evento sobre cola | Cola configurada como durable | Evento `pedido.creado.rabbitmq`: `ms-pedidos` publica y `ms-inventario` consume. |

### ¿Cuándo conviene cada uno? (párrafo de análisis)

El **TCP** de petición-respuesta sirve cuando el llamante necesita una respuesta inmediata y la
serialización manual es aceptable; su costo es el **acoplamiento temporal** medido en el Avance 1.
**gRPC** cubre el mismo caso síncrono pero **añade un contrato tipado** (`.proto`): conviene cuando
dos servicios deben acordar una interfaz estable y compartir tipos sin duplicarlos —por eso Pedidos
lo usa para obtener el `nombre`/`precio` **reales** de Productos en lugar de confiar en el cliente.
Del lado asíncrono, **Redis Pub/Sub** es la opción más rápida y ligera para *fire-and-forget* donde
perder un evento es tolerable (el emisor no espera y el mensaje es efímero). **RabbitMQ** conviene cuando se necesita mayor control sobre el procesamiento de
mensajes que el ofrecido por Redis Pub/Sub. La cola durable mejora la capacidad
de conservar el flujo de mensajería ante interrupciones, aunque la garantía final
depende de la configuración del broker, de la persistencia del mensaje y de las
confirmaciones utilizadas., a cambio de más infraestructura y algo más de latencia.
En resumen: **síncrono con contrato → gRPC**; **asíncrono con garantía de entrega → RabbitMQ**;
los transportes del Avance 1 se conservan como línea base comparativa.

En este avance, RabbitMQ se eligió porque permite trabajar con una cola explícita,
un consumidor identificado y un flujo asíncrono más controlado que Redis Pub/Sub.

## Flujo real `POST /api/pedidos` (donde vive gRPC + RabbitMQ)

A diferencia del benchmark del Avance 1, el flujo de pedido real ejercita los transportes nuevos
([`ms-pedidos/.../pedidos.service.ts`](../../ms-pedidos/src/modules/pedidos/services/pedidos.service.ts) → `create()`):

1. **gRPC** — `obtenerSnapshotsProductos()` consulta cada `productoId` a `ms-productos`
   (`ObtenerProducto`) para tomar `nombre`/`precio` **del servidor**, nunca del cliente.
2. Valida stock contra `ms-inventario` por HTTP.
3. Calcula el total con los precios reales y persiste el pedido (Prisma).
4. **RabbitMQ** — publica `pedido.creado.rabbitmq` en la cola durable `cafe_campus_pedidos`;
   `ms-inventario` lo consume con `@EventPattern` y lo registra.

Evidencias del flujo exitoso:

- [`pedidos-grpc-rabbitmq.txt`](../avance2-evidencias/pedidos-grpc-rabbitmq.txt):
  respuesta del pedido creado con los datos obtenidos desde MS Productos.
- [`avance2-pedido-grpc-rabbitmq.png`](../avance2-evidencias/avance2-pedido-grpc-rabbitmq.png):
  captura del pedido exitoso.
- [`rabbitmq-inventario.txt`](../avance2-evidencias/rabbitmq-inventario.txt):
  registro del evento consumido por MS Inventario.
- [`avance2-rabbitmq-inventario-log.png`](../avance2-evidencias/avance2-rabbitmq-inventario-log.png):
  captura del consumidor RabbitMQ.

## Manejo de excepciones (error controlado que NO tumba el servicio)

**Qué se controla y cómo:**

- **Producto inexistente por gRPC.** El servidor
  ([`productos-grpc.controller.ts`](../../ms-productos/src/modules/productos/controllers/productos-grpc.controller.ts))
  captura el fallo de `findOne` y lanza `RpcException({ code: NOT_FOUND })` en lugar de dejar
  propagar la excepción cruda. El cliente
  ([`pedidos.service.ts`](../../ms-pedidos/src/modules/pedidos/services/pedidos.service.ts) →
  `obtenerSnapshotsProductos`) envuelve la llamada en **`try/catch`** y traduce el error a
  `HttpException(..., 422 UNPROCESSABLE_ENTITY)`. Resultado: el cliente recibe un `422` claro y
  **ningún servicio se cae**.
  Evidencia: [`error-producto-inexistente-grpc.txt`](../avance2-evidencias/error-producto-inexistente-grpc.txt)
  y [`avance2-error-producto-inexistente-grpc.png`](../avance2-evidencias/avance2-error-producto-inexistente-grpc.png).

- **Producto no disponible.** Si `disponible === false`, se lanza un error dentro del mismo
  `try/catch`, que también se traduce a `422` con un mensaje descriptivo.

- **Fallo de stock (HTTP).** `validarStock()` captura el `AxiosError` de `ms-inventario` y re-lanza
  `HttpException 422` con el mensaje del servicio.

- **Publicación RabbitMQ *best-effort*.** `publicarPedidoCreadoRabbitMQ()` y `descontarStock()` van
  con `.catch()`: si el broker o Inventario fallan **después** de crear el pedido, el error se
  registra (`console.error`) pero **el pedido ya persistido no se invalida** (la compensación queda
  como mejora futura). La consulta gRPC utiliza un timeout de 3000 ms y la publicación RabbitMQ uno de
1500 ms. Las operaciones HTTP hacia Inventario gestionan los errores mediante
`try/catch` y `.catch()`.

**Estrategia consistente:** cada transporte captura su propio tipo de error en el borde del servicio
y lo traduce a la abstracción del llamante (gRPC→HTTP 422, Axios→HTTP 422, RMQ→log + best-effort),
de modo que **un fallo aguas abajo nunca derriba el proceso** que lo invoca.

## Conclusión

El Avance 2 demuestra que los cuatro transportes cumplen roles complementarios: gRPC aporta un canal
síncrono **tipado por contrato** para datos autoritativos del servidor, y RRabbitMQ aporta un canal asíncrono basado en cola y con mayor capacidad de
retención y control de consumo que Redis Pub/Sub. El manejo de excepciones —traducción de `RpcException` a HTTP `422` mediante
`try/catch`— evidencia, con un error real y reproducible (producto inexistente), que un fallo
controlado **no interrumpe la disponibilidad** de los microservicios.
