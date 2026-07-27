# Anexo 02. Registro del uso de inteligencia artificial

> Documento vivo. Se agrega una entrada por cada instrucción relevante que el
> autor entregó a la herramienta. La sección 5 de la bitácora remite a este
> anexo para no repetir su contenido.

## 1. Herramienta y modo de uso

El autor utilizó Claude Code (modelo Claude Opus 5) sobre el repositorio local,
con acceso de lectura al código fuente. La herramienta no operó de forma
autónoma, sino dentro de un método de trabajo que el autor definió antes de la
primera consulta y mantuvo durante toda la actividad.

Dicho método impuso cuatro restricciones. La primera prohibió a la herramienta
ejecutar `git add` y `git commit`, de modo que el autor revisó y confirmó
personalmente cada commit al cierre de cada sprint. La segunda obligó a
planificar y a verificar el código antes de modificarlo. La tercera fijó una
división del trabajo en una fase de línea base, cuatro sprints y una fase final,
con revisión del autor entre uno y otro. La cuarta delimitó el alcance
versionable de la actividad y excluyó de los commits los materiales de trabajo
que no forman parte del entregable (el enunciado del examen y la configuración
local de herramientas).

El enunciado de la actividad D, el catálogo de actividades y la asignación
individual no se citan por ruta en este anexo porque corresponden a material
aportado por el autor y no forman parte del repositorio versionado; su
contenido se revisó a partir de la documentación que el autor proporcionó, no
de una referencia consultable en el repositorio final.

El autor definió además el estándar de redacción de los entregables, a través de
una guía de estilo académico propia (configuración local de herramientas, no
versionada en este repositorio), y la estructura documental basada en anexos
referenciados desde la bitácora.

## 2. División del trabajo

La tabla 1 distingue las tareas que correspondieron al autor de aquellas que
ejecutó la herramienta. Esta separación resulta necesaria para valorar el
registro de la sección 3 en sus términos reales.

**Tabla 1.** Reparto de responsabilidades

| Corresponde al autor | Corresponde a la herramienta |
|---|---|
| Definición del método de trabajo, las fases y los puntos de revisión | Análisis del código y redacción de borradores bajo ese método |
| Creación del proyecto en Sentry y generación del DSN | Verificación de que el DSN quedó inyectado en el contenedor |
| Decisión final sobre cada propuesta técnica, previa verificación contra el código | Formulación de propuestas y justificación técnica de cada una |
| Ejecución de los commits y control del historial | Preparación de los cambios sin confirmarlos |
| Estándar de redacción y estructura documental | Aplicación de ese estándar a cada documento |
| Alcance versionable del examen | Advertencia sobre rutas no rastreadas |

## 3. Instrucciones entregadas

La columna de instrucción presenta el pedido del autor redactado de manera
formal, con las rutas de archivo y el servicio afectado de forma explícita.
Dicha reformulación describe el mismo pedido original, sin ampliar su alcance.
La última columna registra la decisión que tomó el autor sobre cada respuesta.

**Tabla 2.** Registro de instrucciones, respuestas y decisiones

| # | Instrucción entregada por el autor | Respuesta de la herramienta | Decisión del autor |
|:--:|---|---|---|
| 1 | El autor fijó el método completo de trabajo sobre el repositorio `30732_ProyectoCafeCampus`, rama `exam/IMarcusDev`: planificación previa a cualquier cambio de código, una fase inicial de evidencia, cuatro sprints, una fase final, revisión suya al cierre de cada sprint, prohibición de ejecutar `git add` y `git commit`, y documentación de apoyo en `docs/examen/IMarcusDev/anexos/` como documento vivo. Solicitó un diagnóstico de qué microservicios carecían de integración con Sentry y la justificación técnica de un candidato. | Diagnóstico del estado de Sentry por servicio. Señaló que `docker-compose.final.yml` inyecta `SENTRY_DSN` a los cuatro contenedores mientras solo el Gateway lo lee. Propuso ms-inventario por ser el único servicio con cuatro transportes simultáneos, planteó excluir el Paso 0 y sugirió una secuencia de seis commits. Advirtió que ningún servicio tiene herramientas de prueba instaladas. | El autor verificó ambas propuestas contra el código antes de resolver. Aceptó ms-inventario, dado que la etiqueta `transport` solo resulta demostrable en un servicio con varios transportes. Aceptó excluir el Paso 0, tras comprobar la integración previa en `gateway/src/observability/sentry.ts:3`. |
| 2 | El autor incorporó al proyecto una guía propia de redacción académica y ordenó aplicarla a todo documento posterior. Delimitó el alcance versionable de la actividad y excluyó de los commits los materiales del enunciado del examen y la configuración local de herramientas, por no formar parte del entregable. Requirió además la lista definitiva de anexos. | Confirmó que no existían documentos previos por corregir. Advirtió que las rutas excluidas figuran como no rastreadas, por lo que un `git add .` las incorporaría al commit. | El autor detectó que la propuesta inicial de cinco anexos duplicaba contenido de la bitácora y ordenó consolidarla en tres, con el procedimiento de reproducción trasladado a la sección 6 de la bitácora. Adoptó el uso de rutas explícitas al confirmar cambios. |
| 3 | El autor autorizó la ejecución de la fase 0 y estableció que la evidencia debía documentar el comportamiento previo a cualquier modificación de código. | Verificó los datos operativos del entorno (puerto 15673 para la consola de RabbitMQ, cola `cafe_campus_pedidos`, ausencia del archivo `.env`). Redactó los anexos 00 y 02, la bitácora y el procedimiento de captura. Detectó y corrigió un error propio en la cita de `sentry-exception.filter.ts`, que había ubicado en la línea 15 cuando corresponde a la 14. | El autor aprobó el procedimiento y estableció el criterio metodológico de configurar el DSN antes de la captura previa, de modo que la ausencia del evento en el panel se explique por la falta de código y no por la falta de credencial. |
| 4 | El autor resolvió crear un proyecto propio en Sentry para disponer de un panel bajo su control, ante la falta de acceso al proyecto del Avance 3. Consultó qué plataforma correspondía seleccionar y autorizó el arranque anticipado del stack de `docker-compose.final.yml`. | Indicó la plataforma Node.js en lugar de Express o NestJS, por coherencia con la dependencia `@sentry/node` declarada en `gateway/package.json:17` y porque los errores por instrumentar se originan en transportes que no son HTTP. Comprobó que `.env` figura en `.gitignore:3` antes de crearlo. | El autor creó el proyecto en Sentry, generó el DSN y lo incorporó al archivo `.env`. Advirtió que el contenedor de ms-inventario debía recrearse, dado que Docker Compose lee las variables al crear el contenedor y no al editarlas. |
| 5 | El autor ordenó ejecutar la captura de la línea base con el DSN ya operativo. | Recreó el contenedor de ms-inventario, comprobó las tres condiciones de la línea base, provocó el `TypeError` mediante la publicación de un evento sin la propiedad `items` y generó el archivo `antes-error-sin-captura.txt`, con la clave del DSN enmascarada. | El autor validó las tres condiciones de la línea base como suficientes para sostener la evidencia. |
| 6 | El autor revisó los entregables de la fase 0, advirtió que faltaba la evidencia fotográfica del panel y ordenó obtenerla. Creó el proyecto `node-xc` en la organización `espe-h6` e inició sesión personalmente en el navegador, dado que la herramienta no dispone de credenciales. | Navegó al proyecto con el identificador obtenido del propio DSN, comprobó que no registraba eventos, capturó la imagen y eliminó los artefactos que el navegador dejó en el repositorio. Señaló que el bloque «Preview a Sentry Issue» de la interfaz podría confundirse con eventos reales del proyecto. | El autor validó la captura como evidencia del lado del panel y aprobó que la aclaración sobre ese bloque constara en la bitácora y en el archivo de evidencia, para evitar una lectura equivocada durante la calificación. |
| 7 | El autor revisó el commit de la fase 0 y autorizó el inicio del sprint 1: inicialización condicional de Sentry en ms-inventario, replicando la convención ya usada en el Gateway. | Creó `ms-inventario/src/observability/sentry.ts` como copia exacta de `gateway/src/observability/sentry.ts`, con el `serviceName` ajustado, y conectó `initSentry('ms-inventario')` en `main.ts` antes de `NestFactory.create`. Agregó `@sentry/node` a `package.json` y, al fallar `npm ci` por desincronización del lockfile, regeneró `package-lock.json` en un contenedor efímero antes de recrear el servicio. Verificó el arranque exitoso con el DSN real ya activo. | El autor aprobó la réplica exacta del módulo del Gateway en lugar de una inicialización distinta, y aprobó la regeneración del lockfile en vez de alterar el comando de arranque del stack, ambas registradas como decisiones técnicas en la sección 3 de la bitácora. |

## 4. Errores de la herramienta respecto al repositorio

La herramienta incurrió en un error verificable sobre el estado del proyecto. El
archivo `CLAUDE.md`, generado por ella misma en una sesión previa, afirmaba que
la autenticación del Gateway era un marcador de posición que sería sustituido
durante el Avance 3. Esa afirmación resultó falsa, dado que el Avance 3 ya
estaba entregado y la cadena de emisión y validación de JWT se encontraba
implementada en `gateway/src/auth/auth.service.ts` y registrada en
`gateway/src/main.ts`.

El autor detectó el error al abrir esos archivos en lugar de confiar en la
documentación previa, y ordenó corregirlo antes de iniciar el examen. De ese
episodio derivó la regla de verificación que rigió toda la actividad. Ninguna
afirmación de la herramienta sobre el repositorio se dio por válida sin abrir el
archivo correspondiente y confirmar el número de línea, en particular las citas
que exige el criterio C2 de la rúbrica. Esa regla permitió además detectar el
error de la herramienta en la cita de `sentry-exception.filter.ts`, registrado en
la entrada 3 de la tabla 2.

## 5. Registro de cambios

**Tabla 3.** Control de cambios

| Fecha | Cambio |
|---|---|
| 2026-07-27 | Versión inicial con las cinco primeras instrucciones de la fase 0. |
