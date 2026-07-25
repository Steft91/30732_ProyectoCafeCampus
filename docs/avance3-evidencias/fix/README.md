# Fixes del Avance 2 para iniciar Avance 3

Esta carpeta agrupa la trazabilidad de los arreglos aplicados después de la
retroalimentación del Avance 2. Se ubica dentro de las evidencias del Avance 3
porque estos ajustes son el punto de partida verificable antes de continuar con
seguridad, observabilidad e integración final.

## Documentos

| Documento | Contenido |
|---|---|
| [`correcciones-avance2.md`](correcciones-avance2.md) | Lista de hallazgos corregidos y estado de cada punto. |

## Evidencias relacionadas

Las capturas y salidas crudas siguen en:

- [`../../avance2-evidencias/fix/`](../../avance2-evidencias/fix/)
- [`../../avance1-evidencias/avance1-benchmark-sync-zero-delay.txt`](../../avance1-evidencias/avance1-benchmark-sync-zero-delay.txt)
- [`../../avance1-evidencias/avance1-benchmark-async-zero-delay.txt`](../../avance1-evidencias/avance1-benchmark-async-zero-delay.txt)

## Capturas post-retroalimentación

Estas capturas no representan funcionalidades nuevas del Avance 3. Documentan
que, después de aplicar la retroalimentación, el repositorio queda en un punto
estable para continuar con el cierre final.

- [`fix-rama-avance3.png`](fix-rama-avance3.png): rama de trabajo y estado Git limpio.
- [`fix-docker-healthy.png`](fix-docker-healthy.png): stack Docker levantado y servicios disponibles.
- [`fix-pedido-exitoso.png`](fix-pedido-exitoso.png): pedido exitoso después de las correcciones.
- [`fix-error-controlado.png`](fix-error-controlado.png): producto inexistente con respuesta controlada.
- [`fix-rabbitmq-consumo.png`](fix-rabbitmq-consumo.png): consumo del evento RabbitMQ por MS Inventario.

![Rama y estado Git luego de fixes](fix-rama-avance3.png)

![Stack Docker luego de fixes](fix-docker-healthy.png)

![Pedido exitoso luego de fixes](fix-pedido-exitoso.png)

![Error controlado luego de fixes](fix-error-controlado.png)

![Consumo RabbitMQ luego de fixes](fix-rabbitmq-consumo.png)
