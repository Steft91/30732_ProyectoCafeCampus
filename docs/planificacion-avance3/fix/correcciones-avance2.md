# Correcciones del Avance 2 para iniciar Avance 3

Este documento consolida los pedidos de corrección de las retroalimentaciones del
Avance 1 y Avance 2 para que el cierre del Avance 2 quede verificable y sin
afirmaciones que no existan en código.

## Prioridad alta

| Hallazgo | Estado | Evidencia esperada |
|---|---|---|
| Faltaba `RpcExceptionFilter` real con `@Catch(RpcException)` y registro global. | Corregido en rama `fix-avance-2`. | Filtros en `src/common/filters/rpc-exception.filter.ts` y registro en `main.ts` de Productos, Pedidos e Inventario. |
| El benchmark TCP usaba excepción HTTP dentro de `@MessagePattern`. | Corregido previamente. | `ms-pedidos/src/modules/benchmark/benchmark.tcp.controller.ts` lanza `RpcException({ code: UNAVAILABLE })`. |
| Docker Compose no ejecutaba migraciones Prisma en arranque limpio. | Corregido previamente. | `docker-compose.yml` ejecuta `npx prisma migrate deploy` antes de `npm run start:dev`. |

## Prioridad media

| Hallazgo | Acción |
|---|---|
| README y documentación afirmaban un filtro inexistente. | Actualizar documentación para apuntar a rutas reales del filtro. |
| Links provisionales de corrección estaban ubicados en `planificacion-avance2`. | Reubicados en `docs/planificacion-avance3/fix/` para separar el cierre fix del Avance 2 del material propio del Avance 2. |
| Evidencias y Kanban estaban enlazados pero no embebidos. | Embeber capturas en README con sintaxis `![]`. |
| Fecha del tag `v2-avance2` quedó desactualizada tras retag. | Sincronizar la sección de tags con el estado evaluado: commit `c2c861e`, 2026-07-21. |
| Tabla de latencia mantenía typo `1.56 ms`. | Corregido a `1.67 ms`. |

## Prioridad operativa

| Hallazgo | Acción |
|---|---|
| Redis y RabbitMQ no tenían `healthcheck`. | Agregar healthchecks y cambiar dependencias consumidoras a `service_healthy`. |
| Faltaban filas de benchmark con delays en cero. | Agregada comparación con evidencia cruda para `BENCHMARK_PEDIDOS_DELAY_MS=0` y `BENCHMARK_INVENTARIO_DELAY_MS=0`. |
| Descuento de stock seguía como best-effort con `.catch(console.error)`. | Implementada compensación: si el descuento posterior falla, el pedido se marca `CANCELADO`. |
