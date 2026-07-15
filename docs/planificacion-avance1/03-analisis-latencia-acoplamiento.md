# Análisis de latencia y acoplamiento temporal — Avance 1 (criterio C2)

## Tabla de latencias (200 peticiones, `benchmark.js`)

| Camino    | Transporte     | Promedio (ms) | p95 (ms) | Máx (ms) | Errores |
| --------- | -------------- | ------------: | -------: | -------: | ------: |
| Síncrono  | TCP encadenado |    **104.89** |   106.00 |   162.00 |       0 |
| Asíncrono | Redis pub/sub  |      **1.67** |     2.00 |    70.00 |       0 |

Fuente: `docs/avance1-benchmark-sync.txt`, `docs/avance1-benchmark-async.txt`.

## Por qué se ACUMULA la latencia en el camino síncrono

`GET /api/benchmark/sync` recorre **Gateway → (TCP) → MS Pedidos → (TCP) → MS Inventario**,
y cada salto **espera (`await`)** la respuesta del siguiente antes de continuar. El tiempo total
es la **suma** de los tramos, no el máximo:

```
delay Pedidos (BENCHMARK_PEDIDOS_DELAY_MS = 40)
+ delay Inventario (BENCHMARK_INVENTARIO_DELAY_MS = 60)
+ costo de dos saltos TCP inter-proceso
≈ 100 ms → medido: 104.89 ms de promedio
```

El promedio de **104.89 ms** coincide con la suma de los retardos artificiales (40 + 60) más el sobrecosto de comunicación entre procesos. La conclusión empírica: **cada dependencia síncrona adicional añade su latencia a la cadena**; con N saltos, los tiempos se acumulan linealmente.

## Por qué el camino asíncrono es ~63× más rápido en responder

`GET /api/benchmark/async` publica un evento en Redis (`emit('pedido.creado.async')`) y responde **apenas el broker acepta el mensaje**, sin esperar a que MS Inventario lo procese. El consumidor (`@EventPattern`) trabaja después, por su cuenta (con su propio `BENCHMARK_ASYNC_DELAY_MS = 120`, que no cuenta para el tiempo de respuesta del emisor). Por eso el promedio cae a **1.56 ms**: solo se mide el tiempo de publicar, no el de procesar.

## Qué es el ACOPLAMIENTO TEMPORAL (prueba de caída)

**Acoplamiento temporal** = todos los servicios de una cadena deben estar **vivos al mismo tiempo**
para que la operación tenga éxito. Se demostró apagando **MS Inventario** con el resto activo
(evidencia: `docs/avance1-caida-servicio.txt`):

- **Camino síncrono → FALLA.** `curl .../benchmark/sync` responde:

    ```json
    {
        "message": "Camino síncrono no disponible: MS Pedidos o MS Inventario no respondió",
        "error": "Service Unavailable",
        "statusCode": 503
    }
    ```

    Falla porque Gateway, Pedidos e Inventario deben coexistir para completar la cadena.

- **Camino asíncrono → SE ACEPTA igual.** `curl .../benchmark/async` responde
  `"aceptado": true` con `duracionMs ≈ 1`, aunque MS Inventario esté detenido.
  El Gateway publica el evento y no espera una respuesta del consumidor, por lo que
  la disponibilidad inmediata de MS Inventario no condiciona la respuesta HTTP del emisor.

    Sin embargo, al utilizar Redis Pub/Sub, el evento no es persistente. Si no existe un consumidor activo al momento de la publicación, no se garantiza su procesamiento posterior. La prueba demuestra desacoplamiento temporal del emisor, pero no entrega garantizada.

## Conclusión

Los resultados evidencian que el camino síncrono presenta una mayor latencia debido a que cada servicio debe esperar la respuesta del siguiente antes de completar la solicitud. En la prueba realizada, el promedio fue de 104.89 ms y la caída de MS Inventario provocó una respuesta HTTP 503, demostrando el acoplamiento temporal de la cadena.

Por otro lado, el camino asíncrono respondió en promedio en 1.67 ms, ya que el Gateway publica el evento en Redis y no espera a que MS Inventario complete su procesamiento. Incluso con el consumidor detenido, el emisor respondió HTTP 200, evidenciando un menor acoplamiento temporal desde la perspectiva del productor.

No obstante, Redis Pub/Sub utiliza un modelo de mensajería no persistente. Por ello, esta implementación demuestra desacoplamiento temporal y reducción del tiempo de respuesta, pero no garantiza que un evento publicado durante la caída del consumidor sea procesado posteriormente.
Para requerimientos de entrega garantizada sería necesario utilizar un mecanismo de mensajería persistente.
