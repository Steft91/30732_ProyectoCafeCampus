# Bitácora — Examen Final

---

## 0. Identificación

| | |
|---|---|
| **Nombre** | Marcos Escobar |
| **Usuario GitHub** | @IMarcusDev |
| **Grupo / Proyecto** | Cafe Campus (`30732_ProyectoCafeCampus`) |
| **Actividad asignada** | D — Observabilidad con contexto en un microservicio |
| **Rama** | `exam/IMarcusDev` |
| **Tag** | `examen-IMarcusDev` |
| **Pull Request** | *(pendiente, fase final)* |
| **Tarjeta Kanban** | *(pendiente, fase final)* |
| **¿Hiciste el Paso 0?** | No. La integración de Sentry ya existía en `gateway/src/observability/sentry.ts:3`, junto con el filtro `gateway/src/common/filters/sentry-exception.filter.ts:11`. El enunciado exige el Paso 0 solo cuando el repositorio carece por completo de Sentry, condición que no se cumplió. |

---

## 1. Qué construí

Antes de esta actividad, ms-inventario no tenía ningún código de observabilidad: solo el Gateway
capturaba errores hacia Sentry, y únicamente los que llegaban por HTTP. Ahora ms-inventario
inicializa Sentry de forma condicional al DSN y captura las excepciones de sus tres transportes
reales (TCP, Redis, RabbitMQ) con las etiquetas `service` y `transport`, un identificador de
correlación (`pedido_id`), contexto de la operación ejecutada y un breadcrumb con el payload que
originó el error, saneando antes cualquier dato personal. En el camino se encontró y corrigió un
bug preexistente del repositorio: el filtro de excepciones que ya existía nunca se había ejecutado,
en ningún transporte, porque su mecanismo de registro (`useGlobalFilters()` llamado después de
`connectMicroservice()`) llega estructuralmente tarde en NestJS. Quedó pendiente la prueba
automatizada (sección 7 y 8).

---

## 2. Anclaje con el repositorio de mi grupo — **obligatorio (C2)**

| Código preexistente | Archivo:línea | Cómo me conecto con él |
|---|---|---|
| `initSentry`, con inicialización condicional al DSN | `gateway/src/observability/sentry.ts:3` y la guarda de la línea 6 | Se replicó la misma firma y la misma guarda en el módulo equivalente de ms-inventario, en lugar de inventar otro mecanismo de arranque. |
| `SentryExceptionFilter`, convención de etiquetas del Gateway | `gateway/src/common/filters/sentry-exception.filter.ts:24` | Se tomó como referencia de convención. La etiqueta `service` mantiene el mismo nombre y el mismo propósito en ms-inventario. |
| `RpcExceptionFilter` de ms-inventario | `ms-inventario/src/common/filters/rpc-exception.filter.ts:5` | Se extendió este filtro (ahora `@Catch()` en lugar de `@Catch(RpcException)`, con un parámetro de transporte). No se creó uno paralelo. |
| Registro previo del filtro por transporte, `useGlobalFilters()` sobre cada microservicio | `ms-inventario/src/main.ts:26`, `:35` y `:47` (versión anterior al sprint 2) | Se verificó que este registro nunca surtió efecto: `connectMicroservice()` vincula los handlers antes de que el código pueda llamar `.useGlobalFilters()` sobre la instancia devuelta. Se sustituyó por `@UseFilters()` en cada controlador, mecanismo que sí se resuelve a tiempo. |
| Consumidor del evento `pedido.creado.rabbitmq` | `ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts:21` (ahora con `@UseFilters(new RpcExceptionFilter('rabbitmq'))`) | Se agregó el decorador sobre el controlador existente, sin tocar la lógica del manejador. El contexto de operación y la correlación se agregan en el sprint 3. |
| `BenchmarkTcpController` y `BenchmarkEventsController`, controladores TCP y Redis ya existentes | `ms-inventario/src/modules/benchmark/benchmark.tcp.controller.ts:9` y `benchmark.events.controller.ts:11` | Se agregó el mismo decorador `@UseFilters()`, con `'tcp'` y `'redis'` respectivamente, para que los tres transportes reales del servicio queden cubiertos de forma simétrica. |

**¿Qué convención del repositorio seguí para que mi código no desentone?**

La misma convención de tags que ya usa `SentryExceptionFilter` del Gateway (`scope.setTag`,
`scope.setContext`, dentro de `Sentry.withScope`), extendida con `transport` y `pedido_id` para
cubrir lo que un microservicio necesita y el Gateway no. Detalle completo en
[`anexos/01-convencion-observabilidad.md`](anexos/01-convencion-observabilidad.md).

**¿Qué NO dupliqué, pudiendo hacerlo?**

No creé un segundo filtro para agregar contexto; se extendió el mismo `RpcExceptionFilter` del
sprint 2. Tampoco generé un identificador de correlación nuevo: se reutilizó `pedidoId`, que
ms-pedidos y el Gateway ya generan aguas arriba.

---

## 3. Decisiones técnicas

### Decisión 1
- **Qué decidí:** Replicar de forma idéntica el módulo `initSentry` del Gateway (`gateway/src/observability/sentry.ts`) en `ms-inventario/src/observability/sentry.ts`, cambiando únicamente el parámetro `serviceName` a `'ms-inventario'`, en lugar de escribir una inicialización distinta para el microservicio.
- **Alternativa que descarté:** Diseñar una función de inicialización propia para ms-inventario, con otra forma de leer el DSN o de decidir el modo no-op.
- **Por qué:** El enunciado exige integrarse con el repositorio existente, no crear una pieza paralela. El Gateway ya resolvió correctamente el caso borde exigido (no-op sin DSN), así que duplicar esa solución exacta evita introducir una segunda convención de arranque en el mismo sistema.

### Decisión 2
- **Qué decidí:** Regenerar `ms-inventario/package-lock.json` con `npm install --package-lock-only` en un contenedor efímero, en lugar de forzar el arranque con `npm install` en el `command` del servicio o editar el lockfile a mano.
- **Alternativa que descarté:** Cambiar el `command` de `docker-compose.final.yml` de `npm ci` a `npm install`, que habría evitado el error sin regenerar nada.
- **Por qué:** Modificar el comando de arranque del compose afecta a los cuatro servicios y excede el alcance de la actividad. Regenerar el lockfile resuelve el problema en el archivo correcto y mantiene `npm ci` como el mecanismo de instalación reproducible que ya usa el resto del stack.

### Decisión 3
- **Qué decidí:** Sustituir el registro de filtros mediante `microservice.useGlobalFilters()` en `main.ts` por el decorador `@UseFilters()` aplicado directamente sobre cada controlador (`PedidosRabbitmqController`, `BenchmarkTcpController`, `BenchmarkEventsController`), en lugar de mantener el mecanismo original.
- **Alternativa que descarté:** Conservar `useGlobalFilters()` y asumir que capturaba las excepciones, sin verificarlo en tiempo de ejecución.
- **Por qué:** Al reproducir el caso de la fase 0 después de conectar el filtro, este no se invocó (comprobado con una traza temporal en el propio `catch()`). La causa es que `NestApplicationContext.connectMicroservice()` vincula los handlers de patrón de forma síncrona dentro de esa misma llamada, antes de que `main.ts` pueda invocar `.useGlobalFilters()` sobre la instancia devuelta. Esto significa que el registro original del repositorio (ya presente antes de esta actividad, en las líneas 26, 35 y 47 de la versión previa de `main.ts`) nunca capturó nada. Se optó por `@UseFilters()`, que sí se resuelve a tiempo porque su metadato se lee directamente del controlador, verificado de punta a punta contra el panel de Sentry.

### Decisión 4
- **Qué decidí:** Pasar el nombre del handler (`'PedidosRabbitmqController.handlePedidoCreado'`, etc.) como segundo parámetro del constructor de `RpcExceptionFilter`, en lugar de obtenerlo dinámicamente desde `ArgumentsHost`.
- **Alternativa que descarté:** Leer `host.getClass()` y `host.getHandler()` dentro del filtro para derivar el nombre de la operación automáticamente.
- **Por qué:** Se verificó en `node_modules/@nestjs/microservices/context/rpc-proxy.js` que, en el camino de manejo de errores RPC, el `ExecutionContextHost` se construye solo con los argumentos de la llamada (`new ExecutionContextHost(args)`), sin `constructorRef` ni `handler`; ambos métodos devuelven `null`. Intentar leerlos habría fallado en silencio. Pasar el nombre como dato conocido en el sitio de registro es correcto y no depende de un detalle interno del framework que además resultó no funcionar como se esperaba.

---

## 4. Las 3 preguntas de mi actividad

**Pregunta 1: ¿Por qué la inicialización debe ser no-op cuando no hay DSN en vez de fallar al arrancar?**

> Porque la observabilidad es una capacidad secundaria del servicio, no una dependencia dura de su
> función. Si `initSentry()` lanzara una excepción sin DSN, un entorno local o de desarrollo sin
> cuenta de Sentry no podría levantar ms-inventario, y el equipo perdería la posibilidad de correr
> el stack sin depender de un servicio externo de terceros. Esto se verificó en el sprint 1
> ejecutando `initSentry('ms-inventario')` con `SENTRY_DSN` vacío dentro del propio contenedor: el
> servicio arrancó sin lanzar, igual que ya hacía el Gateway.

**Pregunta 2: ¿Qué información nunca debe llegar a Sentry desde un sistema con datos de usuarios, y qué hiciste concretamente para impedirlo?**

> Identificadores de usuario, credenciales y cualquier dato personal. En este sistema, el payload
> del evento `pedido.creado.rabbitmq` trae `usuarioId`, y el manejador ya lo escribía en el log
> del servicio (`pedidos-rabbitmq.controller.ts:26`). La función `sanear()` en
> `rpc-exception.filter.ts` reemplaza ese campo (y `password`, `token`, `email`, si estuvieran
> presentes) por `'[REDACTED]'` antes de adjuntar el payload al breadcrumb. Se verificó en el panel
> de Sentry que el evento capturado muestra `usuarioId: [REDACTED]`, mientras que `pedidoId` (un
> identificador interno, no un dato personal) llega en claro porque es lo que permite correlacionar
> el error con el pedido de origen.

**Pregunta 3: ¿Qué diferencia hay entre un tag y un contexto en Sentry, y por qué elegiste precisamente esos tags?**

> Un tag es un par clave-valor indexado y buscable: Sentry permite filtrar y agrupar issues por él
> (por ejemplo, ver todos los errores con `transport=rabbitmq`). Un contexto es un objeto más rico,
> visible en el detalle del evento, pero no indexado para búsqueda. Por eso `service`, `transport`
> y `pedido_id` son tags (son exactamente los criterios por los que se necesita filtrar: qué
> servicio, por qué transporte, de qué pedido), mientras que el nombre completo del handler
> (`operacion.handler`) va como contexto, porque es información de detalle que no tendría sentido
> buscar de forma masiva.

---

## 5. Uso de Inteligencia Artificial — **obligatorio**

**¿Usaste IA en este examen?**  ☒ Sí  ☐ No

Se utilizó Claude Code (modelo Claude Opus 5) sobre el repositorio local. El
registro completo de instrucciones, respuestas y correcciones aplicadas se
encuentra en [`anexos/02-prompts-ia.md`](anexos/02-prompts-ia.md), junto con la
descripción de los errores que la herramienta cometió respecto al repositorio.
Dicho anexo se actualiza al cierre de cada sprint.

Dos restricciones rigieron el uso de la herramienta. La primera prohibió la
ejecución automática de `git add` y `git commit`, de modo que cada commit fue
revisado y confirmado por el autor. La segunda obligó a planificar y a verificar
el código antes de modificarlo, criterio que surgió de un error previo de la
propia herramienta descrito en la sección 3 del anexo 02.

---

## 6. Evidencia

| Archivo | Qué demuestra |
|---|---|
| `antes-error-sin-captura.txt` | Lado de la consola. Línea base verificada por comandos: el DSN sí estaba inyectado en el contenedor, el paquete `@sentry/node` no estaba instalado y el código fuente no contenía referencias a Sentry. Incluye el `TypeError` provocado y la salida completa del servicio. |
| `antes-panel-sentry-vacio.png` | Lado del panel. Proyecto `node-xc` de la organización `espe-h6`, filtro `is:unresolved` sobre las últimas 24 horas, sin ningún evento recibido. Sentry muestra el asistente de instalación del SDK, lo que confirma que el proyecto nunca recibió un evento. |
| `despues-panel-sentry.png` | Panel de Sentry, evento `TypeError` del issue `NODE-XC-1`, con 2 ocurrencias registradas (fase 0 y sprint 2/3). |
| `despues-tags-contexto.png` | Detalle del mismo evento: sección Tags (`service=ms-inventario`, `transport=rabbitmq`, `pedido_id=EXAM-D-SPRINT3-001`) y sección Contexts (`operacion` con `handler=PedidosRabbitmqController.handlePedidoCreado` y `pedidoId`). |

Las evidencias antes/después son complementarias y cubren los dos extremos que
pide la actividad. El archivo en texto y la imagen previa demuestran que el
error ocurrió y no llegó al panel pese al DSN configurado. Las dos imágenes
finales demuestran que, tras la implementación, el mismo tipo de error llega al
panel con tags y contexto completos, y que el dato sensible (`usuarioId`) no
viaja en claro (verificado en el breadcrumb del evento, visible al abrir el
issue completo en Sentry).

Sobre `antes-panel-sentry-vacio.png` conviene una aclaración. El bloque titulado
«Preview a Sentry Issue», ubicado a la derecha, corresponde a una demostración
de la propia interfaz de Sentry y no a eventos del proyecto. Los identificadores
que allí aparecen pertenecen a otros lenguajes y marcos de trabajo. El estado
real del proyecto es el que indica el mensaje principal, «Your code sleuth
eagerly awaits its first mission», junto con los tres pasos de instalación del
SDK.

**Cómo reproducir mi cambio desde cero:**

```bash
cp .env.example .env
# Editar .env y colocar un SENTRY_DSN real (proyecto Node.js en Sentry).
docker compose -f docker-compose.final.yml up -d

curl -u guest:guest -X POST \
  http://localhost:15673/api/exchanges/%2F/amq.default/publish \
  -H "Content-Type: application/json" \
  -d '{"properties":{},"routing_key":"cafe_campus_pedidos","payload_encoding":"string","payload":"{\"pattern\":\"pedido.creado.rabbitmq\",\"data\":{\"pedidoId\":\"cualquier-id\",\"usuarioId\":\"3\",\"total\":4.5,\"creadoEn\":\"2026-01-01T00:00:00.000Z\"}}"}'

# Esperar ~1 minuto (retraso de ingesta de Sentry) y revisar el panel:
# tags service=ms-inventario, transport=rabbitmq, pedido_id=<el id enviado>;
# contexto "operacion"; breadcrumb con usuarioId como [REDACTED].
```

---

## 7. Prueba automatizada

| | |
|---|---|
| **Archivo de la prueba** | No existe. |
| **Comando para ejecutarla** | `` |
| **Qué verifica** | — |
| **¿Falla sin mi cambio?** | No aplica. |

**No se implementó por falta de tiempo dentro del bloque de 2 horas.** El sprint 4 planificado en
[`anexos/00-plan-sprints.md`](anexos/00-plan-sprints.md) preveía instalar Jest en ms-inventario
(el servicio no tenía ningún framework de pruebas configurado) y verificar dos casos: que
`initSentry()` no lanza sin `SENTRY_DSN`, y que `RpcExceptionFilter.catch()` llama a
`Sentry.captureException` con los tags correctos y sin `usuarioId` en claro. Ambos casos sí se
verificaron manualmente (sección 6 y anexo 01), pero no quedaron como prueba automatizada
reproducible. Esto limita el criterio C3 de la rúbrica, que exige explícitamente al menos una
prueba que falle sin el cambio y pase con él.

---

## 8. Estado final — honesto

**Funciona:**
- Inicialización condicional de Sentry en ms-inventario (no-op sin DSN, verificado).
- Captura de excepciones en los tres transportes reales del servicio (TCP, Redis, RabbitMQ) mediante `@UseFilters()`, con tags `service` y `transport`.
- Contexto de operación (`handler`), identificador de correlación (`pedido_id`) y breadcrumb con el payload saneado.
- Saneo de `usuarioId` (y de `password`/`token`/`email` si aparecieran) antes de que cualquier dato llegue a Sentry.
- Evidencia antes/después verificada de punta a punta contra un proyecto real de Sentry (`node-xc`, organización `espe-h6`), no solo por lectura de código.
- Se detectó y corrigió un bug preexistente en el repositorio (el registro de filtros por `useGlobalFilters()` en `main.ts` nunca funcionó, en ningún transporte, desde antes de esta actividad).

**No funciona / quedó incompleto:**
- No hay prueba automatizada (sección 7). Es la pieza pendiente más importante de la actividad.
- El saneo de datos sensibles (`sanear()`) cubre una lista fija de campos (`usuarioId`, `password`, `token`, `email`); no es una solución genérica para cualquier campo sensible futuro.
- No se instrumentó el módulo HTTP de `InventarioController` (solo los tres controladores con patrones RPC), porque ningún error de ese módulo pasó por el punto ciego que motivó la actividad.

**Cuál era mi siguiente paso:**

Instalar Jest en `ms-inventario` (siguiendo el mismo criterio de import mínimo que ya usa el resto
del stack) y escribir dos pruebas unitarias: una para `initSentry()` (no-op sin DSN) y otra para
`RpcExceptionFilter.catch()` (captura con los tags correctos y sin datos sensibles), tal como
detalla el sprint 4 del plan.

---

## 9. Declaración

> Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la sección 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre:** Marcos Escobar
**Fecha:** 2026-07-27
