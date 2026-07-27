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

## 1. Que construi

En construccion. La actividad endurece el consumidor RabbitMQ existente para que procese eventos de pedido creado de forma idempotente.

---

## 2. Anclaje con el repositorio de mi grupo - obligatorio (C2)

| Codigo preexistente | Archivo:linea | Como me conecto con el |
|---|---|---|
| Publisher RabbitMQ de pedido creado | `ms-pedidos/src/modules/pedidos/services/pedidos.service.ts:184` | Uso el evento existente `pedido.creado.rabbitmq`; no creo un evento paralelo. |
| Patron de evento consumido por Inventario | `ms-inventario/src/modules/eventos/pedidos-rabbitmq.controller.ts:21` | Extiendo el consumidor existente para validar payload, descartar duplicados y registrar el procesamiento. |
| Modulo de eventos de Inventario | `ms-inventario/src/modules/eventos/eventos.module.ts:4` | Registro la logica nueva dentro del modulo existente de eventos. |

**Que convencion del repositorio segui para que mi codigo no desentone?**

Pendiente de completar despues de implementar.

**Que NO duplique, pudiendo hacerlo?**

No cree un consumidor nuevo ni un evento alterno; la actividad se integra sobre el evento RabbitMQ que ya publica `ms-pedidos`.

---

## 3. Decisiones tecnicas

### Decision 1
- **Que decidi:** Pendiente.
- **Alternativa que descarte:** Pendiente.
- **Por que:** Pendiente.

### Decision 2
- **Que decidi:** Pendiente.
- **Alternativa que descarte:** Pendiente.
- **Por que:** Pendiente.

---

## 4. Las 3 preguntas de mi actividad

**Pregunta 1:** Por que la garantia "al menos una vez" obliga a que la idempotencia viva en el consumidor y no en el publisher?

> Pendiente.

**Pregunta 2:** Donde guardas la clave procesada, y que ocurre si el proceso muere entre aplicar el efecto y guardar la clave? Que harias para cerrar esa ventana?

> Pendiente.

**Pregunta 3:** Que diferencia hay entre reintentar un mensaje y mandarlo a una cola de mensajes muertos (DLQ)? Cuando conviene cada uno?

> Pendiente.

---

## 5. Uso de Inteligencia Artificial - obligatorio

**Usaste IA en este examen?** Si

| # | Que le pedi | Que me devolvio | Que corregi, adapte o descarte - y por que |
|:--:|---|---|---|
| 1 | Analizar la asignacion, el PDF del examen y el repositorio para identificar mi actividad exacta. | Identifico que me corresponde la actividad C y propuso trabajar sobre `pedido.creado.rabbitmq`. | Acepte el anclaje porque existe en el repo; descarte tocar actividades D o E porque pertenecen a otros integrantes. |

**En que se equivoco respecto a mi repositorio?**

Pendiente de completar durante la implementacion si aparece una suposicion incorrecta.

---

## 6. Evidencia

| Archivo | Que demuestra |
|---|---|
| `antes-evento-duplicado.txt` | Antes del cambio, el mismo evento RabbitMQ `pedido.creado.rabbitmq` llega dos veces al consumidor y se registra dos veces en logs. |
| `antes-evento-duplicado.png` | Captura visual del mismo comportamiento previo: dos logs para el mismo `pedidoId`. |
| `despues-evento-duplicado.txt` | Despues del cambio, el mismo evento se procesa una vez, el duplicado se descarta con log y la BD muestra un solo registro. |
| `prueba-idempotencia.txt` | Salida de build y prueba automatizada de idempotencia. |

**Como reproducir mi cambio desde cero:**

```bash
# Pendiente de completar con los comandos exactos.
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
- Pendiente.

**No funciona / quedo incompleto:**
- Pendiente.

**Cual era mi siguiente paso:**

Pendiente.

---

## 9. Declaracion

Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la seccion 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre:** Stefany Diaz
**Fecha:** 2026-07-27
