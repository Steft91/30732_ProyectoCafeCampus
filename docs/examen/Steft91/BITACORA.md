# Bitácora - Examen Final

## 0. Identificación

| | |
|---|---|
| **Nombre** | Stefany Díaz |
| **Usuario GitHub** | @Steft91 |
| **Grupo / Proyecto** | Grupo 3 - CafeCampus |
| **Actividad asignada** | C - Consumidor asíncrono idempotente |
| **Rama** | `exam/Steft91` |
| **Tag** | `examen-Steft91` |
| **Pull Request** | https://github.com/Steft91/30732_ProyectoCafeCampus/pull/25 |
| **Tarjeta Kanban** | Movida a Hecho con enlace al PR. Evidencias: `kanban-actividad-proceso.png` y `kanban-examen-Steft91.png`. |
| **Hiciste el Paso 0?** | No aplica. La actividad C no tiene Paso 0; el repositorio ya publica eventos RabbitMQ desde Pedidos hacia Inventario. |

---

## 1. Qué construí

Endurecí el consumidor RabbitMQ existente de Inventario para que el evento `pedido.creado.rabbitmq` sea procesado de forma idempotente, es decir, que si se envía dos veces el mismo evento, se descarta el duplicado. Ahora el evento viaja con una `idempotencyKey`, el consumidor persiste la clave en PostgreSQL y un duplicado se descarta con log controlado en vez de volver a producir efecto. También agregué validación de payload para descartar eventos inválidos sin tumbar el servicio y una prueba automatizada que cubre duplicados, eventos distintos y carga inválida.

---

## 2. Anclaje con el repositorio de mi grupo - obligatorio (C2)

| Código preexistente | Archivo:línea | Cómo me conecto con él |
|---|---|---|
| Publisher RabbitMQ de pedido creado | `ms-pedidos/src/modules/pedidos/services/pedidos.service.ts:184` | Uso el cliente RabbitMQ existente y mantengo el mismo evento `pedido.creado.rabbitmq`; solo agrego `idempotencyKey` al payload. |
| Patrón de evento consumido por Inventario | `ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts:12` | Mantengo el `@EventPattern('pedido.creado.rabbitmq')` existente y delego el procesamiento idempotente al servicio nuevo. |
| Módulo de eventos de Inventario | `ms-inventario/src/modules/eventos/eventos.module.ts:6` | Registro el servicio de idempotencia dentro del módulo existente de eventos. |
| Persistencia de Inventario con Prisma | `ms-inventario/src/prisma/schema.prisma:40` | Agrego el modelo `EventoProcesado` en el esquema de Inventario para guardar claves procesadas. |

**Qué convención del repositorio seguí para que mi código no desentone?**

Seguí la estructura NestJS que ya usa el repo: `controller` delgado, servicio inyectable con la lógica, registro en el módulo correspondiente y Prisma para persistencia. También usé `Logger` de NestJS, migraciones Prisma versionadas y nombres alineados con el dominio (`PedidosRabbitmqService`, `EventoProcesado`, `pedido.creado.rabbitmq`).

**Qué NO dupliqué, pudiendo hacerlo?**

No creé un consumidor nuevo, una cola nueva ni un evento alterno. Tampoco moví la idempotencia al publisher: el publisher solo envía una clave única y el consumidor decide si procesa o descarta.

---

## 3. Decisiones técnicas

### Decisión 1
- **Qué decidí:** Guardar las claves procesadas en PostgreSQL, en `inventario_schema.eventos_procesados`, con `clave` única.
- **Alternativa que descarté:** Guardarlas en memoria dentro del proceso de `ms-inventario`.
- **Por qué:** La memoria se pierde al reiniciar y no sirve si hay más de una instancia del consumidor. PostgreSQL ya era parte del microservicio y la restricción única permite descartar duplicados incluso si llegan muy cerca en el tiempo. Además, la persistencia permite hacer pruebas de duplicados sin tener que levantar RabbitMQ.

### Decisión 2
- **Qué decidí:** Crear `PedidosRabbitmqService` y dejar el controller solo como adaptador del `@EventPattern`.
- **Alternativa que descarté:** Meter validación, persistencia y manejo de duplicados directamente en `PedidosRabbitmqController`.
- **Por qué:** El repo ya separa responsabilidades con servicios inyectables. Así la lógica se puede probar sin levantar RabbitMQ y el controller sigue siendo pequeño.

---

## 4. Las 3 preguntas de mi actividad

**Pregunta 1:** Por qué la garantía "al menos una vez" obliga a que la idempotencia viva en el consumidor y no en el publisher?

> Porque el publisher no controla cuántas veces el broker entregará el mensaje. En RabbitMQ puede haber reintentos, reconexiones o confirmaciones perdidas, y el mismo evento puede llegar más de una vez (lo que podría causar efectos duplicados, como descontar inventario dos veces o repetir un pago) aunque el publisher lo haya emitido una sola vez. En mi implementación, `ms-pedidos` agrega `idempotencyKey`, pero `ms-inventario` es quien consulta/persiste esa clave y decide si procesa o descarta. Esa decisión debe estar cerca del efecto para proteger el estado real del consumidor.

**Pregunta 2:** Dónde guardas la clave procesada, y qué ocurre si el proceso muere entre aplicar el efecto y guardar la clave? Qué harías para cerrar esa ventana?

> Guardo la clave en PostgreSQL, en `inventario_schema.eventos_procesados`, mediante el modelo `EventoProcesado`. En esta versión el efecto auditable es el registro de procesamiento, por lo que la inserción con `clave` única es atómica. Si mañana el consumidor también descontara stock o enviara notificaciones, morir entre aplicar ese efecto y guardar la clave podría permitir duplicados al reintentar. Para cerrar esa ventana usaría una transacción que guarde la clave y aplique el efecto de negocio juntos; si no se puede en la misma base, usaría un patrón inbox/outbox con confirmación posterior.

**Pregunta 3:** Qué diferencia hay entre reintentar un mensaje y mandarlo a una cola de mensajes muertos (DLQ)? Cuándo conviene cada uno?

> Reintentar sirve cuando el error puede ser temporal: base de datos momentáneamente caída, red lenta o servicio no disponible. Una DLQ sirve cuando el mensaje ya no debería bloquear la cola principal: payload inválido, error repetido después de agotar reintentos o dato que requiere revisión manual. En este cambio, un duplicado no se reintenta ni va a DLQ porque no es un fallo: se descarta de forma controlada. Un payload inválido se descarta con log para no tumbar el consumidor.

---

## 5. Uso de Inteligencia Artificial - obligatorio

**Usaste IA en este examen?** Sí

| # | Qué le pedí | Qué me devolvió | Qué corregí, adapté o descarté - y por qué |
|:--:|---|---|---|
| 1 | Analizar la asignación para identificar mi actividad exacta. | Identificó que me corresponde la actividad C y propuso trabajar sobre `pedido.creado.rabbitmq`. | Acepté el anclaje porque existe en el repo; descarté tocar actividades D o E porque pertenecen a otros integrantes. |
| 2 | Ayudarme a implementar idempotencia sin romper el flujo existente. | Propuso agregar `idempotencyKey`, persistir claves procesadas y separar la lógica en un servicio probado. | Lo adapté al stack real del repo: NestJS, Prisma, RabbitMQ existente y `docker-compose.final.yml`. |
| 3 | Ayudarme a estructurar correctamente la bitácora para que cubra lo que pide la plantilla. | Me devolvió una estructura base con secciones de anclaje, decisiones, evidencia, prueba y estado final. | La corregí y la adapté a mi forma de explicar el trabajo, agregando lo que realmente hice, las evidencias que tomé y mis propias respuestas sobre idempotencia. |

**En qué se equivocó respecto a mi repositorio?**

La principal corrección fue no afirmar que antes ya existía un efecto duplicado en base de datos. Al revisar el consumer real vi que `PedidosRabbitmqController` solo registraba logs, así que usé logs como evidencia previa y creé la persistencia de claves como parte de mi cambio. También evité tocar actividades de mis compañeros aunque había código de Sentry/JWT en el proyecto.

---

## 6. Evidencia

| Archivo | Qué demuestra |
|---|---|
| `antes-evento-duplicado.txt` | Antes del cambio, el mismo evento RabbitMQ `pedido.creado.rabbitmq` llega dos veces al consumidor y se registra dos veces en logs. |
| `antes-evento-duplicado.png` | Captura visual del mismo comportamiento previo: dos logs para el mismo `pedidoId`. |
| `despues-evento-duplicado.txt` | Después del cambio, el mismo evento se procesa una vez, el duplicado se descarta con log y la BD muestra un solo registro. |
| `despues-evento-duplicado.png` | Captura visual de la prueba posterior: log de duplicado descartado y/o consulta con un solo registro. |
| `prueba-idempotencia.txt` | Salida de build y prueba automatizada de idempotencia. |
| `kanban-actividad-proceso.png` | Captura de mi tarjeta Kanban de la actividad C en progreso. |
| `kanban-examen-Steft91.png` | Captura final de la tarjeta Kanban en Hecho con el PR enlazado. |

**Cómo reproducir mi cambio desde cero:**

```bash
git switch exam/Steft91
docker compose -f docker-compose.final.yml up -d ms-inventario ms-pedidos
docker compose -f docker-compose.final.yml exec -T ms-inventario npx prisma migrate deploy --schema src/prisma/schema.prisma
docker compose -f docker-compose.final.yml exec -T ms-inventario npm run test:idempotencia

docker compose -f docker-compose.final.yml exec -T ms-inventario node -e "const { ClientProxyFactory, Transport } = require('@nestjs/microservices'); const { firstValueFrom, timeout } = require('rxjs'); const client = ClientProxyFactory.create({ transport: Transport.RMQ, options: { urls: ['amqp://guest:guest@rabbitmq:5672'], queue: 'cafe_campus_pedidos', queueOptions: { durable: true } } }); const evento = { idempotencyKey: 'pedido.creado.rabbitmq:exam-duplicado-despues-Steft91', pedidoId: 'exam-duplicado-despues-Steft91', usuarioId: 'Steft91', total: 7.5, items: [{ productoId: 'producto-demo-examen', nombre: 'Cafe examen', precio: 7.5, cantidad: 1 }], creadoEn: new Date().toISOString() }; (async () => { await firstValueFrom(client.emit('pedido.creado.rabbitmq', evento).pipe(timeout(3000))); await firstValueFrom(client.emit('pedido.creado.rabbitmq', evento).pipe(timeout(3000))); await client.close(); console.log('Evento con idempotencyKey publicado 2 veces:', JSON.stringify(evento)); })().catch((error) => { console.error(error); process.exit(1); });"

docker compose -f docker-compose.final.yml logs --tail=40 ms-inventario
docker compose -f docker-compose.final.yml exec -T postgres psql -U postgres -d cafe_campus -c "SELECT clave, tipo, \"referenciaId\", COUNT(*) OVER () AS total_registros FROM inventario_schema.eventos_procesados WHERE clave = 'pedido.creado.rabbitmq:exam-duplicado-despues-Steft91';"
```

---

## 7. Prueba automatizada

| | |
|---|---|
| **Archivo de la prueba** | `ms-inventario/src/modules/eventos/pedidos-rabbitmq.service.spec.ts` |
| **Comando para ejecutarla** | `docker compose -f docker-compose.final.yml exec -T ms-inventario npm run test:idempotencia` |
| **Qué verifica** | Evento duplicado deja un registro; eventos distintos dejan dos; payload inválido se descarta. |
| **Falla sin mi cambio?** | Sí. Sin el servicio de idempotencia y la persistencia de claves no existe el comportamiento `duplicado` ni el registro único. |

Salida de la prueba pasando:

```text
OK - idempotencia RabbitMQ validada
```

---

## 8. Estado final - honesto

**Funciona:**
- El publisher RabbitMQ de `ms-pedidos` envía `idempotencyKey`.
- El consumer de `ms-inventario` persiste la clave procesada.
- El mismo evento duplicado queda con un solo registro en BD y el duplicado se descarta con log.
- Dos eventos distintos se procesan como registros distintos.
- Un payload inválido se descarta sin tumbar el proceso.
- La prueba automatizada `test:idempotencia` pasa.

**No funciona / quedo incompleto:**
- La parte técnica de la actividad C está completa según las pruebas realizadas. El PR quedó abierto, la tarjeta Kanban quedó en Hecho y el tag `examen-Steft91` fue creado y subido al remoto.

**Cuál era mi siguiente paso:**

Subir el enlace del Pull Request a Moodle, que es el único paso externo al repositorio.

---

## 9. Declaración

Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la sección 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre:** Stefany Díaz
**Fecha:** 2026-07-27
