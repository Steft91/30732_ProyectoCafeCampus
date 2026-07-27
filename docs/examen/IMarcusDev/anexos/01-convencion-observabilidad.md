# Anexo 01. Convención de observabilidad en ms-inventario

## 1. Tags

| Tag | Origen | Propósito |
|---|---|---|
| `service` | Constante `'ms-inventario'`, fijada en el filtro | Identifica el microservicio, con el mismo nombre que usa `SentryExceptionFilter` del Gateway para `service='gateway'`. |
| `transport` | Parámetro del constructor de `RpcExceptionFilter` (`'tcp'` \| `'redis'` \| `'rabbitmq'`) | Distingue el transporte real por el que llegó el evento, dato que el Gateway no puede aportar porque solo ve HTTP. |
| `pedido_id` | Campo `pedidoId` del payload RPC, cuando existe | Permite filtrar en Sentry todos los errores de un pedido concreto. |

Los tags son valores atómicos e indexados: Sentry permite buscar y agrupar issues por ellos. Por
eso se usan para lo que se necesita filtrar (servicio, transporte, identificador de correlación).

## 2. Contexto

El contexto `operacion` adjunta un objeto con más detalle del que un tag admite:

```json
{ "handler": "PedidosRabbitmqController.handlePedidoCreado", "pedidoId": "..." }
```

Se eligió pasar `handler` como parámetro explícito del filtro (segundo argumento del
constructor) en lugar de intentar leerlo desde `ArgumentsHost.getClass()`/`getHandler()`: se
verificó que, en el camino de errores de `@nestjs/microservices`
(`node_modules/@nestjs/microservices/context/rpc-proxy.js`), el `ExecutionContextHost` se
construye solo con los argumentos de la llamada (`new ExecutionContextHost(args)`), sin
`constructorRef` ni `handler`, por lo que ambos métodos devuelven `null` en este contexto. Pasar el
nombre como dato conocido en el sitio de registro es más simple y no depende de un detalle interno
del framework.

## 3. Identificador de correlación

`pedidoId` viaja en el payload de los tres flujos (`pedido.creado.rabbitmq`, el benchmark TCP y el
benchmark Redis) porque ms-pedidos y el Gateway ya lo generan aguas arriba. El filtro lo toma del
payload RPC (`host.switchToRpc().getData()`) y lo expone como tag y como campo del contexto, sin
necesidad de generar un identificador nuevo.

## 4. Breadcrumb

Antes de capturar la excepción, el filtro agrega un breadcrumb (`category: 'rpc'`) con el mensaje
`Excepcion en <handler>` y el payload saneado. Esto permite reconstruir, en el panel de Sentry, qué
handler se ejecutó y con qué datos justo antes del error, sin depender del stack trace.

## 5. Saneo de datos sensibles

`sanear()` (en `rpc-exception.filter.ts`) reemplaza por `'[REDACTED]'` los campos `usuarioId`,
`password`, `token` y `email` si están presentes en el payload, antes de que ese payload se adjunte
al breadcrumb. Se verificó en el panel de Sentry que `usuarioId` llega como `[REDACTED]` y que
`pedidoId` (no sensible, es solo un identificador interno) llega en claro.

## 6. Verificación

Se reprodujo el `TypeError` de la fase 0 después de esta implementación y se confirmó en Sentry:
tags `service=ms-inventario`, `transport=rabbitmq`, `pedido_id=EXAM-D-SPRINT3-001`; contexto
`operacion` con `handler` y `pedidoId`; breadcrumb con el payload saneado.
