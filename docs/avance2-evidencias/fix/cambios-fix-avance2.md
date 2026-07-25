# Cambios fix aplicados al Avance 2

Este documento resume solo los cambios realizados para corregir los pedidos de
arreglo de la retroalimentación del Avance 1 y Avance 2, integrados dentro del
flujo de cierre del Avance 2.

## 1. Filtros RPC reales

### `ms-productos/src/common/filters/rpc-exception.filter.ts`
- Se agregó `RpcExceptionFilter` con `@Catch(RpcException)`.
- El filtro devuelve `exception.getError()` como error observable del transporte.

### `ms-pedidos/src/common/filters/rpc-exception.filter.ts`
- Se agregó el mismo filtro para handlers internos TCP.

### `ms-inventario/src/common/filters/rpc-exception.filter.ts`
- Se agregó el mismo filtro para handlers TCP, Redis y RabbitMQ.

### `ms-productos/src/main.ts`
- Se registró el filtro en el microservicio gRPC con `useGlobalFilters()`.
- Se removió el import no usado de `join`.

### `ms-pedidos/src/main.ts`
- Se registró el filtro en el microservicio TCP con `useGlobalFilters()`.

### `ms-inventario/src/main.ts`
- Se registró el filtro en los microservicios TCP, Redis y RabbitMQ con `useGlobalFilters()`.

## 2. Infraestructura Docker

### `docker-compose.yml`
- Se mantuvo `npx prisma migrate deploy --schema src/prisma/schema.prisma` antes de `npm run start:dev`
  en `ms-productos`, `ms-inventario` y `ms-pedidos`.
- Se agregaron healthchecks a Redis (`redis-cli ping`) y RabbitMQ (`rabbitmq-diagnostics -q ping`).
- `ms-inventario`, `ms-pedidos` y `gateway` ahora esperan `service_healthy` para los brokers que consumen.
- Se parametrizaron delays del benchmark:
  - `BENCHMARK_PEDIDOS_DELAY_MS`
  - `BENCHMARK_INVENTARIO_DELAY_MS`
  - `BENCHMARK_ASYNC_DELAY_MS`

## 3. Flujo gRPC y pedidos

### `ms-productos/src/modules/productos/controllers/productos-grpc.controller.ts`
- Se mantiene `RpcException({ code: NOT_FOUND })` cuando el producto no existe.

### `ms-pedidos/src/modules/pedidos/services/pedidos.service.ts`
- Se mantiene `try/catch` en `obtenerSnapshotsProductos()` para traducir errores gRPC a HTTP `422`.
- Se conserva `timeout(3000)` para evitar esperas indefinidas en gRPC.
- Se conserva `timeout(1500)` para la publicación RabbitMQ.
- Se reemplazó el manejo pasivo de error de descuento de stock por compensación:
  si `descontarStock()` falla después de crear el pedido, `compensarPedidoPorFalloStock()`
  marca el pedido como `CANCELADO`.

## 4. Benchmark TCP y latencia

### `ms-pedidos/src/modules/benchmark/benchmark.tcp.controller.ts`
- Se reemplazó `ServiceUnavailableException` por `RpcException` con código `UNAVAILABLE`.

### `docs/planificacion-avance1/03-analisis-latencia-acoplamiento.md`
- Se corrigió `1.56 ms` a `1.67 ms`.
- Se agregó comparación con delays artificiales y con delays en cero.

### `docs/avance1-evidencias/avance1-benchmark-sync-zero-delay.txt`
- Se agregó evidencia cruda del benchmark TCP con delays en cero:
  promedio `6.85 ms`, p95 `9.00 ms`, máximo `67.00 ms`, errores `0`.

### `docs/avance1-evidencias/avance1-benchmark-async-zero-delay.txt`
- Se agregó evidencia cruda del benchmark Redis con delays en cero:
  promedio `3.10 ms`, p95 `4.00 ms`, máximo `75.00 ms`, errores `0`.

## 5. Documentación del Avance 2

### `README.md`
- Se alineó la sección de excepciones con filtros reales registrados en código.
- Se embebieron evidencias con imágenes inline.
- Se embebió la captura Kanban del Avance 1 y Avance 2.
- Se agregó URL de Projects del repositorio.
- Se sincronizó `v2-avance2` con la fecha evaluada `2026-07-21` y commit `c2c861e`.
- Se agregó la tabla de latencia con delays en cero.

### `TABLERO_KANBAN.md`
- Se agregó URL de Projects del repositorio.
- Se marcó como hecha la tarjeta de tag `v2-avance2`.
- Se embebió la captura del Kanban del Avance 2.

### `docs/planificacion-avance2/README.md`
- Se ajustó la decisión técnica para mencionar `RpcExceptionFilter` real.

### `docs/planificacion-avance2/01-roles-y-kanban.md`
- Se retiró la sección provisional de correcciones para dejar Avance 2 solo con su planificación propia.

### `docs/planificacion-avance2/03-comparacion-transportes-excepciones.md`
- Se reemplazó la afirmación genérica del filtro por rutas y transportes reales.
- Se documentó la compensación de stock a `CANCELADO`.

### `docs/planificacion-avance3/fix/correcciones-avance2.md`
- Se creó/reubicó el documento de correcciones solicitadas y su estado.

### `docs/planificacion-avance3/fix/commits-semanticos-fix.md`
- Se creó/reubicó el plan de commits semánticos usado para cerrar la rama de fix.

## 6. Evidencias fix existentes

Carpeta: `docs/avance2-evidencias/fix/`

- `fix-compose-ps.txt` y `fix-compose-ps.png`
- `fix-grpc-error-controlado.txt` y `fix-grpc-error-controlado.png`
- `fix-pedido-exitoso-grpc-rabbitmq.txt` y `fix-pedido-exitoso-grpc-rabbitmq.png`
- `fix-rabbitmq-inventario.txt` y `fix-rabbitmq-inventario.png`
- `README.md`

## 7. Resultado esperado

- El error controlado devuelve `422 Unprocessable Entity`.
- El pedido exitoso crea el pedido correctamente con datos reales de Productos por gRPC.
- RabbitMQ publica y consume el evento en `ms-inventario`.
- TCP y Redis del Avance 1 se conservan.
- Docker Compose levanta con migraciones Prisma y healthchecks de brokers.
- La documentación ya no afirma funcionalidades inexistentes.
