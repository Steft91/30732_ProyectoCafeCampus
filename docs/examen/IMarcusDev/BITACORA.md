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

*(Se completa al cierre del sprint 4, con lo que efectivamente quedó implementado.)*

---

## 2. Anclaje con el repositorio de mi grupo — **obligatorio (C2)**

| Código preexistente | Archivo:línea | Cómo me conecto con él |
|---|---|---|
| `initSentry`, con inicialización condicional al DSN | `gateway/src/observability/sentry.ts:3` y la guarda de la línea 6 | Se replicó la misma firma y la misma guarda en el módulo equivalente de ms-inventario, en lugar de inventar otro mecanismo de arranque. |
| `SentryExceptionFilter`, convención de etiquetas del Gateway | `gateway/src/common/filters/sentry-exception.filter.ts:24` | Se tomó como referencia de convención. La etiqueta `service` mantiene el mismo nombre y el mismo propósito en ms-inventario. |
| `RpcExceptionFilter` de ms-inventario | `ms-inventario/src/common/filters/rpc-exception.filter.ts:5` | Se extendió este filtro. No se creó uno paralelo. |
| Registro del filtro sobre los tres transportes | `ms-inventario/src/main.ts:23`, `:32` y `:44` | Esos tres registros ya distinguían el transporte. Se aprovecharon para inyectar el valor de la etiqueta `transport`. |
| Consumidor del evento `pedido.creado.rabbitmq` | `ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts:21` | Es el punto donde se agregó el breadcrumb y el contexto de operación, sobre el manejador que ya existía. |

**¿Qué convención del repositorio seguí para que mi código no desentone?**

*(Se completa al cierre del sprint 3.)*

**¿Qué NO dupliqué, pudiendo hacerlo?**

*(Se completa al cierre del sprint 3.)*

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

---

## 4. Las 3 preguntas de mi actividad

**Pregunta 1: ¿Por qué la inicialización debe ser no-op cuando no hay DSN en vez de fallar al arrancar?**

> *(pendiente, fase final)*

**Pregunta 2: ¿Qué información nunca debe llegar a Sentry desde un sistema con datos de usuarios, y qué hiciste concretamente para impedirlo?**

> *(pendiente, fase final)*

**Pregunta 3: ¿Qué diferencia hay entre un tag y un contexto en Sentry, y por qué elegiste precisamente esos tags?**

> *(pendiente, fase final)*

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
| `despues-panel-sentry.png` | *(pendiente, fase final)* |
| `despues-tags-contexto.png` | *(pendiente, fase final)* |

Las dos evidencias previas son complementarias y cubren los dos extremos que
pide la actividad. El archivo en texto demuestra que el error ocurrió y que solo
quedó registrado en la salida del contenedor. La imagen demuestra que ese mismo
error no llegó al panel, pese a que el DSN estaba configurado.

Sobre la imagen conviene una aclaración. El bloque titulado «Preview a Sentry
Issue», ubicado a la derecha, corresponde a una demostración de la propia
interfaz de Sentry y no a eventos del proyecto. Los identificadores que allí
aparecen pertenecen a otros lenguajes y marcos de trabajo. El estado real del
proyecto es el que indica el mensaje principal, «Your code sleuth eagerly awaits
its first mission», junto con los tres pasos de instalación del SDK.

**Cómo reproducir mi cambio desde cero:**

```bash
# (se completa al cierre del sprint 4, con los comandos verificados)
```

---

## 7. Prueba automatizada

*(Se completa al cierre del sprint 4.)*

---

## 8. Estado final — honesto

*(Se completa en la fase final.)*

---

## 9. Declaración

> Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la sección 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre:** Marcos Escobar
**Fecha:** 2026-07-27
