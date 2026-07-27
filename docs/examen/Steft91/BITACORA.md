# Bitacora - Examen Final

## 0. Identificacion

| | |
|---|---|
| **Nombre** | Stefany Diaz |
| **Usuario GitHub** | @Steft91 |
| **Grupo / Proyecto** | Grupo 3 - CafeCampus |
| **Actividad asignada** | C - Consumidor asincrono idempotente |
| **Rama** | `exam/Steft91` |
| **Tag** | `examen-Steft91` |
| **Pull Request** | Pendiente |
| **Tarjeta Kanban** | Pendiente |
| **Hiciste el Paso 0?** | No aplica. La actividad C no tiene Paso 0; el repositorio ya publica eventos RabbitMQ desde Pedidos hacia Inventario. |

---

## 1. Que construí

Endureci el consumidor RabbitMQ existente de Inventario para que el evento `pedido.creado.rabbitmq` sea procesado de forma idempotente, es decir que si se envia 2 veces el mismo evento, se descarta el duplicado. Ahora el evento viaja con una `idempotencyKey`, el consumidor persiste la clave en PostgreSQL y un duplicado se descarta con log controlado en vez de volver a producir efecto. Tambien agregue validacion de payload para descartar eventos inválidos sin tumbar el servicio y una prueba automatizada que cubre duplicados, eventos distintos y carga inválida.

---

## 2. Anclaje con el repositorio de mi grupo - obligatorio (C2)

| Código preexistente | Archivo:línea | Como me conecto con el |
|---|---|---|
| Publisher RabbitMQ de pedido creado | `ms-pedidos/src/modules/pedidos/services/pedidos.service.ts:184` | Uso el cliente RabbitMQ existente y mantengo el mismo evento `pedido.creado.rabbitmq`; solo agrego `idempotencyKey` al payload. |
| Patron de evento consumido por Inventario | `ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts:12` | Mantengo el `@EventPattern('pedido.creado.rabbitmq')` existente y delego el procesamiento idempotente al servicio nuevo. |
| Modulo de eventos de Inventario | `ms-inventario/src/modules/eventos/eventos.module.ts:6` | Registro el servicio de idempotencia dentro del modulo existente de eventos. |
| Persistencia de Inventario con Prisma | `ms-inventario/src/prisma/schema.prisma:40` | Agrego el modelo `EventoProcesado` en el schema de Inventario para guardar claves procesadas. |

**Que convencion del repositorio segui para que mi codigo no desentone?**

Segui la estructura NestJS que ya usa el repo: `controller` delgado, servicio inyectable con la lógica, registro en el módulo correspondiente y Prisma para persistencia. Tambien use `Logger` de NestJS, migraciones Prisma versionadas y nombres alineados con el dominio (`PedidosRabbitmqService`, `EventoProcesado`, `pedido.creado.rabbitmq`).

**Que NO duplique, pudiendo hacerlo?**

No cree un consumidor nuevo, una cola nueva ni un evento alterno. Tampoco moví la idempotencia al publisher: el publisher solo envia una clave única y el consumidor decide si procesa o descarta.

---

## 3. Decisiónes técnicas

### Decisión 1
- **Que decidí:** Guardar las claves procesadas en PostgreSQL, en `inventario_schema.eventos_procesados`, con `clave` única.
- **Alternativa que descarte:** Guardarlas en memoria dentro del proceso de `ms-inventario`.
- **Por que:** La memoria se pierde al reiniciar y no sirve si hay mas de una instancia del consumidor. PostgreSQL ya era parte del microservicio y la restriccion unica permite descartar duplicados incluso si llegan muy cerca en el tiempo. Ademas, la persistencia permite hacer pruebas de duplicados sin tener que levantar RabbitMQ.

### Decisión 2
- **Que decidí:** Crear `PedidosRabbitmqService` y dejar el controller solo como adaptador del `@EventPattern`.
- **Alternativa que descarte:** Meter validación, persistencia y manejo de duplicados directamente en `PedidosRabbitmqController`.
- **Por que:** El repo ya separa responsabilidades con servicios inyectables. Así la lógica se puede probar sin levantar RabbitMQ y el controller sigue siendo pequeño. 

---

## 4. Las 3 preguntas de mi actividad

**Pregunta 1:** Por que la garantia "al menos una vez" obliga a que la idempotencia viva en el consumidor y no en el publisher?

> Porque el publisher no controla cuantas veces el broker entregara el mensaje. En RabbitMQ puede haber reintentos, reconexiones o confirmaciones perdidas, y el mismo evento puede llegar más de una vez (lo que podría causar efectos duplicados, como descontar inventario dos veces o repetir un pago) aunque el publisher lo haya emitido una sola vez. En mi implementacion, `ms-pedidos` agrega `idempotencyKey`, pero `ms-inventario` es quien consulta/persiste esa clave y decide si procesa o descarta. Esa Decisión debe estar cerca del efecto para proteger el estado real del consumidor.

**Pregunta 2:** Donde guardas la clave procesada, y que ocurre si el proceso muere entre aplicar el efecto y guardar la clave? Que harias para cerrar esa ventana?

> Guardo la clave en PostgreSQL, en `inventario_schema.eventos_procesados`, mediante el modelo `EventoProcesado`. En esta version el efecto auditable es el registro de procesamiento, por lo que la insercion con `clave` única es atómica. Si mañana el consumidor tambien descontara stock o enviara notificaciones, morir entre aplicar ese efecto y guardar la clave podría permitir duplicados al reintentar. Para cerrar esa ventana usaria una transaccion que guarde la clave y aplique el efecto de negocio juntos y si no se puede en la misma base, usaria un patron inbox/outbox con confirmacion posterior.

**Pregunta 3:** Que diferencia hay entre reintentar un mensaje y mandarlo a una cola de mensajes muertos (DLQ)? Cuando conviene cada uno?

> Reintentar sirve cuando el error puede ser temporal: base de datos momentaneamente caida, red lenta o servicio no disponible. Una DLQ sirve cuando el mensaje ya no deberia bloquear la cola principal: payload inválido, error repetido después de agotar reintentos o dato que requiere revision manual. En este cambio, un duplicado no se reintenta ni va a DLQ porque no es un fallo: se descarta de forma controlada. Un payload inválido se descarta con log para no tumbar el consumidor.

---

## 5. Uso de Inteligencia Artificial - obligatorio

**Usaste IA en este examen?** Si

| # | Que le pedi | Que me devolvio | Que corregi, adapte o descarte - y por que |
|:--:|---|---|---|
| 1 | Analizar la asignacion para identificar mi actividad exacta. | Identifico que me corresponde la actividad C y propuso trabajar sobre `pedido.creado.rabbitmq`. | Acepte el anclaje porque existe en el repo; descarte tocar actividades D o E porque pertenecen a otros integrantes. |
| 2 | Ayudarme a implementar idempotencia sin romper el flujo existente. | Propuso agregar `idempotencyKey`, persistir claves procesadas y separar la logica en un servicio probado. | Lo adapte al stack real del repo: NestJS, Prisma, RabbitMQ existente y `docker-compose.final.yml`. |

**En que se equivoco respecto a mi repositorio?**

La principal correccion fue no afirmar que antes ya existia un efecto duplicado en base de datos. Al revisar el consumer real vi que `PedidosRabbitmqController` solo registraba logs, asi que use logs como evidencia previa y cree la persistencia de claves como parte de mi cambio. Tambien evite tocar actividades de mis compañeros aunque habia codigo de Sentry/JWT en el proyecto.

---

## 6. Evidencia

| Archivo | Que demuestra |
|---|---|
| `antes-evento-duplicado.txt` | Antes del cambio, el mismo evento RabbitMQ `pedido.creado.rabbitmq` llega dos veces al consumidor y se registra dos veces en logs. |
| `antes-evento-duplicado.png` | Captura visual del mismo comportamiento previo: dos logs para el mismo `pedidoId`. |
| `despues-evento-duplicado.txt` | Despues del cambio, el mismo evento se procesa una vez, el duplicado se descarta con log y la BD muestra un solo registro. |
| `despues-evento-duplicado.png` | Captura visual de la prueba posterior: log de duplicado descartado y/o consulta con un solo registro. |
| `prueba-idempotencia.txt` | Salida de build y prueba automatizada de idempotencia. |

**Como reproducir mi cambio desde cero:**

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
| **Que verifica** | Evento duplicado deja un registro; eventos distintos dejan dos; payload invalido se descarta. |
| **Falla sin mi cambio?** | Si. Sin el servicio de idempotencia y la persistencia de claves no existe el comportamiento `duplicado` ni el registro unico. |

Salida de la prueba pasando:

```text
OK - idempotencia RabbitMQ validada
```

---

## 8. Estado final - honesto

**Funciona:**
- El publisher RabbitMQ de `ms-pedidos` envia `idempotencyKey`.
- El consumer de `ms-inventario` persiste la clave procesada.
- El mismo evento duplicado queda con un solo registro en BD y el duplicado se descarta con log.
- Dos eventos distintos se procesan como registros distintos.
- Un payload invalido se descarta sin tumbar el proceso.
- La prueba automatizada `test:idempotencia` pasa.

**No funciona / quedo incompleto:**
- La parte tecnica de la actividad C esta completa segun las pruebas realizadas. Quedan pendientes los pasos administrativos finales: abrir PR, enlazar tarjeta Kanban, completar esos enlaces en esta bitacora y crear/subir el tag.

**Cual era mi siguiente paso:**

Abrir el Pull Request de `exam/Steft91` hacia `main`, mover mi tarjeta Kanban a Hecho con enlace al PR, actualizar esta bitacora con esos enlaces y publicar el tag `examen-Steft91`.

---

## 9. Declaracion

Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la seccion 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre:** Stefany Diaz
**Fecha:** 2026-07-27
