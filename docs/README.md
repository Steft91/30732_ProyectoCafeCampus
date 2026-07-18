# Documentación y evidencias

Esta carpeta reúne la planificación técnica, las evidencias de ejecución y los
resultados obtenidos durante los avances del proyecto **Cafe Campus**.

## Avance 1 — TCP y Redis

### Evidencias

Carpeta: [`avance1-evidencias/`](avance1-evidencias/)

- [`avance1-benchmark-sync.txt`](avance1-evidencias/avance1-benchmark-sync.txt):
  resultados del benchmark del camino síncrono mediante TCP.
- [`avance1-benchmark-async.txt`](avance1-evidencias/avance1-benchmark-async.txt):
  resultados del benchmark del camino asíncrono mediante Redis.
- [`avance1-caida-servicio.txt`](avance1-evidencias/avance1-caida-servicio.txt):
  prueba de acoplamiento temporal con MS Inventario detenido.
- [`sync.png`](avance1-evidencias/sync.png):
  captura de los resultados del camino síncrono.
- [`async.png`](avance1-evidencias/async.png):
  captura de los resultados del camino asíncrono.
- [`avance1-kanban.png`](avance1-evidencias/avance1-kanban.png):
  captura del tablero Kanban del Avance 1.

### Planificación

Carpeta: [`planificacion-avance1/`](planificacion-avance1/)

Contiene la arquitectura, distribución de responsabilidades, patrones aplicados
y análisis de latencia y acoplamiento temporal del Avance 1.

---

## Avance 2 — gRPC y RabbitMQ

### Evidencias

Carpeta: [`avance2-evidencias/`](avance2-evidencias/)

- [`pedidos-grpc-rabbitmq.txt`](avance2-evidencias/pedidos-grpc-rabbitmq.txt):
  respuesta del pedido creado con los datos obtenidos desde MS Productos mediante gRPC.
- [`avance2-pedido-grpc-rabbitmq.png`](avance2-evidencias/avance2-pedido-grpc-rabbitmq.png):
  captura del pedido exitoso.
- [`rabbitmq-inventario.txt`](avance2-evidencias/rabbitmq-inventario.txt):
  registro del evento RabbitMQ recibido por MS Inventario.
- [`avance2-rabbitmq-inventario-log.png`](avance2-evidencias/avance2-rabbitmq-inventario-log.png):
  captura del evento publicado y consumido mediante RabbitMQ.
- [`error-producto-inexistente-grpc.txt`](avance2-evidencias/error-producto-inexistente-grpc.txt):
  respuesta HTTP 422 generada al consultar un producto inexistente.
- [`avance2-error-producto-inexistente-grpc.png`](avance2-evidencias/avance2-error-producto-inexistente-grpc.png):
  captura del error gRPC controlado.

### Planificación

Carpeta: [`planificacion-avance2/`](planificacion-avance2/)

Contiene:

- distribución de responsabilidades y Kanban;
- patrones y principios de diseño aplicados;
- comparación entre TCP, Redis, gRPC y RabbitMQ;
- manejo de excepciones;
- diagrama actualizado de arquitectura.
