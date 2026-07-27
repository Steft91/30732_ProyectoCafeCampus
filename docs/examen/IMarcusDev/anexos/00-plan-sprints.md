# Anexo 00. Selección del microservicio y plan de sprints

> Documento vivo. Se actualiza al cierre de cada sprint con los archivos que
> realmente se modificaron. El registro de cambios se encuentra en la sección 7.

## 1. Objetivo y alcance

La actividad D del examen final requirió instrumentar con observabilidad un
microservicio que no la tuviera, de modo que los errores nacidos dentro de él
llegaran a Sentry con etiquetas y contexto útil. Este anexo documenta el
diagnóstico previo del repositorio, la elección del microservicio y la
planificación del trabajo en fases. La justificación técnica de la convención de
etiquetas se desarrolla en el anexo 01, y el registro del uso de inteligencia
artificial en el anexo 02.

El alcance se limitó a un solo microservicio, tal como establece el enunciado.
No se modificó el Gateway ni los otros dos servicios, dado que la actividad es
individual y el repositorio pertenece a un trabajo grupal previo.

## 2. Estado inicial del repositorio

La revisión del código confirmó que la integración de Sentry existía solo en el
Gateway, a través de `gateway/src/observability/sentry.ts` y del filtro
`gateway/src/common/filters/sentry-exception.filter.ts`. Los tres
microservicios carecían por completo de código relacionado con Sentry.

Sin embargo, el archivo `docker-compose.final.yml` inyecta las variables
`SENTRY_DSN` y `SENTRY_ENVIRONMENT` a los cuatro contenedores. En consecuencia,
tres de ellos recibían una credencial de observabilidad que su código nunca
leía. La tabla 1 resume esta diferencia entre lo que la infraestructura ofrecía
y lo que el código consumía.

**Tabla 1.** Estado de la integración de Sentry por servicio antes del cambio

| Servicio | Código de Sentry en `src/` | Variables inyectadas en `docker-compose.final.yml` |
|---|---|---|
| gateway | Sí (`observability/sentry.ts`) | Líneas 162 a 164 |
| ms-productos | No | Líneas 74 y 75 |
| ms-inventario | No | Líneas 99 y 100 |
| ms-pedidos | No | Líneas 129 y 130 |

Este hallazgo determinó que el Paso 0 del enunciado no fuera necesario, ya que
el repositorio contaba con una integración de Sentry previa sobre la cual
apoyarse. La base preexistente quedó identificada en
`gateway/src/observability/sentry.ts:3`.

## 3. Microservicio seleccionado

Se seleccionó **ms-inventario**. La decisión respondió a que este servicio es el
único que expone cuatro transportes de forma simultánea, condición que vuelve
verificable la etiqueta `transport` exigida por el enunciado. En los otros dos
candidatos esa etiqueta habría tomado siempre el mismo valor, por lo que no
habría demostrado nada. La tabla 2 contrasta los tres candidatos frente a los
requisitos de la actividad.

**Tabla 2.** Comparación de los microservicios candidatos

| Requisito de la actividad | ms-productos | ms-pedidos | ms-inventario |
|---|---|---|---|
| Transportes disponibles para la etiqueta `transport` | HTTP y gRPC | HTTP y TCP | HTTP, TCP, Redis y RabbitMQ |
| Filtro de excepciones previo sobre el que apoyarse | Uno, en gRPC | Uno, en TCP | Tres registros del mismo filtro |
| Errores fuera del alcance del Gateway | Parcial | Parcial | Total en el consumidor de eventos |
| Identificador de correlación disponible en el mensaje | No | No | Sí, `pedidoId` |
| Datos personales que exigen saneo | No | Sí | Sí, `usuarioId` |

El servicio ya registra el mismo filtro en tres puntos distintos de
`ms-inventario/src/main.ts:23`, `:32` y `:44`. Esos tres registros son el lugar
natural para diferenciar el transporte, lo que permite extender el filtro
existente en lugar de crear una pieza paralela.

## 4. Causa de la ausencia de instrumentación

La falta de Sentry en ms-inventario no correspondió a un descuido, sino a una
decisión de alcance del Avance 3 que dejó un punto ciego estructural. La
observabilidad se ubicó en la frontera de confianza del sistema, criterio
coherente con que los microservicios no realizan autenticación propia.

Dicha ubicación tiene un límite técnico verificable. El filtro del Gateway
invoca `host.switchToHttp()` en
`gateway/src/common/filters/sentry-exception.filter.ts:14` y opera sobre los
objetos `Request` y `Response` de Express. Por lo tanto, solo observa lo que
ingresa por HTTP y resulta incapaz de cubrir los transportes TCP, Redis y
RabbitMQ.

A este límite se suma la naturaleza del flujo asíncrono. El evento
`pedido.creado.rabbitmq` se emite sin esperar respuesta, de modo que un error
producido en el consumidor de ms-inventario nunca atraviesa el Gateway. Ese
error termina en el registro del contenedor y ningún componente lo reporta. Por
construcción, y no por omisión, resulta invisible para la observabilidad actual.

## 5. Caso de error escogido para la evidencia

Se escogió un error real y latente del repositorio, en lugar de uno artificial.
El manejador `handlePedidoCreado` accede a `evento.items.length` en
`ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts:24` sin
validar antes la existencia del arreglo. Si el evento llega sin la propiedad
`items`, la ejecución lanza un `TypeError` no controlado.

Este caso resultó adecuado por tres razones. Primero, reproduce el punto ciego
descrito en la sección anterior, ya que el error muere en el registro del
contenedor. Segundo, el filtro actual declara `@Catch(RpcException)` en
`ms-inventario/src/common/filters/rpc-exception.filter.ts:5`, por lo que ni
siquiera intercepta un `TypeError`, lo que justifica ampliar su alcance durante
el sprint 2. Tercero, el mensaje transporta `pedidoId` y `usuarioId`, con lo
que aporta a la vez el identificador de correlación y el dato personal que debe
quedar fuera del reporte.

La reproducción se verificó sobre el stack en ejecución antes de modificar
código. La publicación de un evento sin la propiedad `items` en la cola
`cafe_campus_pedidos` produjo el `TypeError` esperado en la línea 24 del
manejador. El registro mostró que la excepción fue atendida por
`RpcExceptionsHandler`, el manejador por defecto de Nest, y no por el filtro del
repositorio. Este resultado confirmó que el filtro existente no cubre las
excepciones ajenas a `RpcException`.

## 6. Plan de fases

El trabajo se organizó en una fase inicial de línea base, cuatro sprints de
cambio y una fase final de evidencia y entrega. Cada sprint cierra con una
revisión y un commit semántico realizado por el autor. La tabla 3 presenta la
secuencia completa.

**Tabla 3.** Secuencia de fases y commits previstos

| Fase | Objetivo | Commit previsto |
|---|---|---|
| Fase 0 | Línea base y evidencia del comportamiento previo | `chore(examen): preparar rama y alcance de la actividad D` |
| Sprint 1 | Inicialización condicional de Sentry sin operación cuando falta el DSN | `feat(observabilidad): inicializar sentry condicional en ms-inventario` |
| Sprint 2 | Captura de excepciones con etiquetas de servicio y transporte | `feat(observabilidad): capturar excepciones con tags de servicio y transporte` |
| Sprint 3 | Contexto de operación, correlación, breadcrumb y saneo de datos | `feat(observabilidad): agregar breadcrumb, correlacion y saneo de datos sensibles` |
| Sprint 4 | Prueba automatizada de los dos casos borde | `test(observabilidad): verificar sentry no-op sin dsn y captura con tags` |
| Fase final | Evidencia posterior, bitácora y entrega | `docs(examen): bitacora y evidencias de observabilidad en ms-inventario` |

La tabla 4 detalla los archivos previstos por sprint. Se trata de una previsión
inicial, sujeta a ajuste durante la ejecución.

**Tabla 4.** Archivos previstos por sprint

| Sprint | Archivos que se modifican | Archivos que se crean |
|---|---|---|
| 1 | `ms-inventario/package.json`, `ms-inventario/src/main.ts`, `ms-inventario/.env.example` | `ms-inventario/src/observability/sentry.ts` |
| 2 | `ms-inventario/src/common/filters/rpc-exception.filter.ts`, `ms-inventario/src/main.ts` | Ninguno |
| 3 | `ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts`, `ms-inventario/src/observability/sentry.ts` | `docs/examen/IMarcusDev/anexos/01-convencion-observabilidad.md` |
| 4 | `ms-inventario/package.json` | `ms-inventario/jest.config.js`, `ms-inventario/src/observability/sentry.spec.ts`, `ms-inventario/src/common/filters/rpc-exception.filter.spec.ts` |

El enunciado del examen y la configuración local de herramientas se excluyen de
los commits por indicación del autor, dado que no forman parte del entregable
de la actividad. Por ese mismo motivo, este documento no cita esos materiales
por ruta: su contenido se revisó a partir de la documentación que el autor
proporcionó, no de una referencia consultable en el repositorio versionado.

## 7. Registro de cambios del plan

**Tabla 5.** Control de cambios

| Fecha | Fase | Cambio respecto a lo planificado |
|---|---|---|
| 2026-07-27 | Fase 0 | Versión inicial del plan. |
| 2026-07-27 | Sprint 1 | Se agregó `ms-inventario/package-lock.json` a la lista de archivos modificados, no prevista en la tabla 4. Al incorporar `@sentry/node` en `package.json`, el comando `npm ci` que ejecuta el contenedor exige que el lockfile esté sincronizado, por lo que fue necesario regenerarlo con `npm install --package-lock-only` antes de recrear el contenedor. |
| 2026-07-27 | Sprint 2 | Se descubrió que el registro de filtros mediante `microservice.useGlobalFilters()` en `ms-inventario/src/main.ts` nunca surtió efecto, ni siquiera antes de esta actividad: `NestApplicationContext.connectMicroservice()` (`node_modules/@nestjs/core/nest-application.js`, método `connectMicroservice`) vincula los handlers de patrón de forma síncrona dentro de esa misma llamada, antes de que el código de `main.ts` pudiera invocar `.useGlobalFilters()` sobre la instancia devuelta. En consecuencia, se sustituyó ese mecanismo por el decorador `@UseFilters()` a nivel de controlador, que sí se resuelve a tiempo. Esto amplió el alcance previsto: además de `pedidos-rabbitmq.controller.ts`, se modificaron `benchmark.tcp.controller.ts` y `benchmark.events.controller.ts`, no listados en la tabla 4, para que los tres transportes reales de ms-inventario queden cubiertos de forma simétrica. |
| 2026-07-27 | Sprint 3 | El contexto de operación no se agregó dentro de `pedidos-rabbitmq.controller.ts` como preveía la tabla 4, sino en `rpc-exception.filter.ts` (mismo archivo del sprint 2), pasando el nombre del handler como segundo parámetro del constructor del filtro. Se verificó que `ArgumentsHost.getClass()`/`getHandler()` devuelven `null` en el camino de errores RPC, por lo que leerlos dinámicamente no era viable; ese hallazgo se documenta como decisión técnica en la bitácora. Los tres controladores (`pedidos-rabbitmq.controller.ts`, `benchmark.tcp.controller.ts`, `benchmark.events.controller.ts`) solo cambiaron el argumento del decorador `@UseFilters()` ya agregado en el sprint 2. |
| 2026-07-27 | Sprint 4 y fase final | El sprint 4 (prueba automatizada) no se ejecutó por falta de tiempo dentro del bloque de 2 horas. Se pasó directamente a la fase final: captura de evidencia "después" contra el proyecto real de Sentry y cierre de la bitácora (secciones 1, 6, 7 y 8), dejando registrada con honestidad la ausencia de la prueba, conforme al criterio de entrega parcial documentada que rige el enunciado del examen. |
