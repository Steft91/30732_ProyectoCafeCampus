# Plan de correcciones post-retroalimentación (Grupo 3 · Avance 1)

## Contexto

El repositorio recibió retroalimentación sobre el tag `v1-avance1` (commit `a3dc6f2`,
2026-07-15): **18 / 20**. El Avance 2 (`v2-avance2`) ya está cerrado y etiquetado, pero incluye
sobre `main` los mismos puntos señalados por la revisión — ninguno fue corregido entre avances.
Como el equipo se enteró de la retroalimentación **después** de cerrar `v2-avance2`, se corrige
ahora y se vuelve a etiquetar, en vez de reabrir el Avance 1 ya evaluado.

## Resumen de la nota recibida

| Criterio                                |    Nivel     |      Puntos |
| --------------------------------------- | :----------: | ----------: |
| C1. Arquitectura del MVP                |      3       |         2.4 |
| C2. Medición de latencia y acoplamiento |      5       |         4.0 |
| C3. Buenas prácticas                    |      3       |         2.4 |
| C4. Proceso                             |      5       |         4.0 |
| C5. Documentación + diagrama            |      5       |         4.0 |
| **Total**                               | **21 bruto** | **18 / 20** |

El propio informe advierte que **C3 es el riesgo principal para el Avance 2**: la ausencia de un
`ExceptionFilter` para RPC es exactamente lo que el Avance 2 (gRPC + RabbitMQ) evalúa.

## Estado verificado en el código actual (`main`, post-`v2-avance2`, 2026-07-20)

Cada fila fue confirmada contra el código real antes de planificar la acción, no asumida a partir
del informe:

| #   | Hallazgo (G3)                                                                            | Criterio | Archivo                                                              | Estado verificado hoy                                                                                                                | Prioridad |
| --- | ---------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 1   | Falta `RpcExceptionFilter` (`@Catch(RpcException)` + `useGlobalFilters`)                 | C3       | `ms-pedidos/src/main.ts`, `ms-inventario/src/main.ts`                | **Sigue sin existir** — cero coincidencias de `@Catch`/`useGlobalFilters` en el repo                                                 | P1        |
| 2   | `ServiceUnavailableException` (HTTP) lanzada dentro de un `@MessagePattern` TCP          | C3       | `ms-pedidos/src/modules/benchmark/benchmark.tcp.controller.ts:41`    | **Sigue presente**, sin cambios                                                                                                      | P1        |
| 3   | Ningún servicio corre `prisma migrate deploy` en Docker Compose — clon fresco sin tablas | C1       | `docker-compose.yml:38,56,81`                                        | **Sigue igual**: solo `prisma generate`, no `migrate deploy`                                                                         | P1        |
| 4   | URL del tablero Kanban ausente del README; captura no embebida                           | C4       | `README.md`                                                          | **Sigue ausente** (solo se referencia el archivo local, sin URL ni `![Kanban](...)`)                                                 | P2        |
| 5   | Falta desglosar la latencia sin los `setTimeout` artificiales (`delay(40)`/`delay(60)`)  | C2       | `docs/planificacion-avance1/03-analisis-latencia-acoplamiento.md`    | **No agregado** — no hay filas con `BENCHMARK_*_DELAY_MS=0`                                                                          | P2        |
| 6   | Contradicción `1.56 ms` vs `1.67 ms` en el análisis                                      | C2       | `docs/planificacion-avance1/03-analisis-latencia-acoplamiento.md:29` | **Sigue presente**: la tabla dice `1.67`, el párrafo dice `1.56`                                                                     | P2        |
| 7   | `pedidos.service.ts` traga el fallo de descuento de stock con `console.error`            | C3       | `ms-pedidos/src/modules/pedidos/services/pedidos.service.ts:139`     | **Sigue igual** (distinto del `console.error` de la línea 134, que es el publisher RabbitMQ _best-effort_ y es correcto dejarlo así) | P3        |
| 8   | Sin healthcheck/`condition: service_healthy` para Redis/RabbitMQ en los consumidores     | C1       | `docker-compose.yml`                                                 | **Sigue en `service_started`**, no `service_healthy`, para `redis`/`rabbitmq`                                                        | P3        |
| 9   | `seed.ts` con `localhost:3001` hardcodeado sin fallback a env                            | C3       | `ms-inventario/src/prisma/seed.ts:5`                                 | **Ya resuelto** — tiene `process.env.MS_PRODUCTOS_URL ?? 'http://localhost:3001'`                                                    | Cerrado   |
| 10  | Enlace roto en `TABLERO_KANBAN.md` a un archivo inexistente                              | C4       | `TABLERO_KANBAN.md:10`                                               | **Ya resuelto** — enlaza a `docs/planificacion-avance1/01-roles-y-kanban.md`, que existe                                             | Cerrado   |
| 11  | Tarjeta "Crear tag `v1-avance1`" atascada en "Under Review" en la captura                | C4       | Kanban                                                               | **Ya resuelto** — `TABLERO_KANBAN.md:33` la marca `[X]`                                                                              | Cerrado   |

## Plan de corrección por prioridad

### P1 — bloquean directamente criterios evaluados en el Avance 2 (C1, C3)

1. **Crear `RpcExceptionFilter`** (`@Catch(RpcException)`) en `ms-pedidos` y `ms-inventario`, y
   registrarlo con `app.useGlobalFilters()` en cada `main.ts`. Es la pieza de manejo de errores
   que el Avance 2 evalúa y que hoy no existe en ningún punto del código.
2. **Reemplazar `ServiceUnavailableException` por `RpcException`** en
   `benchmark.tcp.controller.ts:41`, mapeando a `status: grpc.status.UNAVAILABLE` (o el código TCP
   equivalente), para no serializar una excepción HTTP dentro de un transporte de microservicio.
3. **Agregar `npx prisma migrate deploy --schema src/prisma/schema.prisma &&`** antes de
   `npm run start:dev` en las tres líneas `command:` de `docker-compose.yml` (38, 56, 81), para que
   un clon fresco levantado solo con `docker compose up -d` tenga tablas.

### P2 — puntos perdidos por poco esfuerzo (C2, C4)

4. Publicar/confirmar la URL del tablero Kanban y **embeber** la captura
   (`![Kanban](docs/avance1-evidencias/avance1-kanban.png)`) en `README.md`, en vez de solo
   mencionarla.
5. Agregar al benchmark del Avance 1 dos filas adicionales con
   `BENCHMARK_PEDIDOS_DELAY_MS=0` / `BENCHMARK_INVENTARIO_DELAY_MS=0`, para aislar el costo neto de
   cada salto TCP del sueño artificial.
6. Corregir `1.56` → `1.67` en `docs/planificacion-avance1/03-analisis-latencia-acoplamiento.md:29`
   para que el párrafo deje de contradecir su propia tabla.

### P3 — higiene, no bloquea nota pero reduce riesgo hacia el Avance 3

7. Decidir el tratamiento del error tragado en `pedidos.service.ts:139` (descuento de stock):
   compensar la orden o emitir un evento de fallo, en vez de solo `console.error`. Puede quedar
   como tarjeta explícita para el Avance 3 si no se resuelve ahora.
8. Añadir `condition: service_healthy` para `redis` y `rabbitmq` en los servicios consumidores de
   `docker-compose.yml`, evitando carreras de arranque ahora que RabbitMQ ya está en el stack.

## Flujo de trabajo y responsables

Este plan se ejecuta en una rama dedicada de corrección, **no** dentro de las ramas ya fusionadas
del Avance 2:

- **Marcos Escobar** — sube la planificación de las correcciones (este documento, la actualización
  de [`01-roles-y-kanban.md`](01-roles-y-kanban.md) y de
  [`05-plan-de-commits.md`](05-plan-de-commits.md)) a `main`. No modifica código de servicio en
  esta fase.
- **Stefany Díaz** — implementa los ítems P1–P3 sobre la rama `fix/correcciones-g3-avance1`, con
  un commit por ítem para mantener trazabilidad. **A la fecha de este documento, esos commits aún
  no existen** — ver estado "en progreso" en la Fase 4 de `05-plan-de-commits.md`.

## Checklist antes de volver a etiquetar `v2-avance2`

- [ ] Ítems P1 (1, 2, 3) implementados y verificados contra un `docker compose up -d` en limpio.
- [ ] Ítems P2 (4, 5, 6) aplicados en `README.md` y en la documentación del Avance 1.
- [ ] Ítems P3 (7, 8) resueltos o movidos explícitamente al backlog del Avance 3.
- [ ] PR de `fix/correcciones-g3-avance1` revisado y fusionado a `main`.
- [ ] Tag `v2-avance2` recreado/movido sobre el `main` corregido (o nuevo tag si el equipo decide
      no reescribir el existente — pendiente de definir por el equipo, fuera del alcance de este
      documento).
