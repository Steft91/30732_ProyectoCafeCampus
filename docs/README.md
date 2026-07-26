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
- [`avance2-kanban.png`](avance2-evidencias/avance2-kanban.png):
  captura del tablero Kanban del Avance 2.

![Kanban Avance 2](avance2-evidencias/avance2-kanban.png)

Carpeta: [`avance2-evidencias/fix/`](avance2-evidencias/fix/)

- [`fix-compose-ps.txt`](avance2-evidencias/fix/fix-compose-ps.txt) y `fix-compose-ps.png`:
  estado del stack luego de aplicar las correcciones.
- [`fix-grpc-error-controlado.txt`](avance2-evidencias/fix/fix-grpc-error-controlado.txt) y `fix-grpc-error-controlado.png`:
  prueba de producto inexistente con respuesta HTTP 422.
- [`fix-pedido-exitoso-grpc-rabbitmq.txt`](avance2-evidencias/fix/fix-pedido-exitoso-grpc-rabbitmq.txt) y `fix-pedido-exitoso-grpc-rabbitmq.png`:
  pedido exitoso con consulta gRPC y publicación RabbitMQ.
- [`fix-rabbitmq-inventario.txt`](avance2-evidencias/fix/fix-rabbitmq-inventario.txt) y `fix-rabbitmq-inventario.png`:
  consumo del evento RabbitMQ por MS Inventario.

### Planificación

Carpeta: [`planificacion-avance2/`](planificacion-avance2/)

Contiene:

- distribución de responsabilidades y Kanban;
- patrones y principios de diseño aplicados;
- comparación entre TCP, Redis, gRPC y RabbitMQ;
- manejo de excepciones;
- diagrama actualizado de arquitectura.

---

## Avance 3 — Seguridad, observabilidad e integración final

### Evidencias finales

Carpeta: [`avance3-evidencias/`](avance3-evidencias/)

- [`servicios-finales-ps.txt`](avance3-evidencias/servicios-finales-ps.txt):
  estado de contenedores del stack final.
- [`servicios-finales.png`](avance3-evidencias/servicios-finales.png):
  captura del stack final levantado.
- [`login-jwt.txt`](avance3-evidencias/login-jwt.txt) y [`login-jwt.png`](avance3-evidencias/login-jwt.png):
  login exitoso y emisión de JWT.
- [`ruta-protegida-200.txt`](avance3-evidencias/ruta-protegida-200.txt) y [`ruta-con-token-valido-200.png`](avance3-evidencias/ruta-con-token-valido-200.png):
  ruta protegida con token válido.
- [`ruta-sin-token-401.txt`](avance3-evidencias/ruta-sin-token-401.txt) y [`ruta-sin-token-401.png`](avance3-evidencias/ruta-sin-token-401.png):
  ruta protegida sin token.
- [`ruta-rol-sin-permiso-403.txt`](avance3-evidencias/ruta-rol-sin-permiso-403.txt) y [`rol-sin-permiso-403.png`](avance3-evidencias/rol-sin-permiso-403.png):
  rol autenticado sin permiso.
- [`flujo-integrado-final.txt`](avance3-evidencias/flujo-integrado-final.txt) y [`flujo-integrado-final.png`](avance3-evidencias/flujo-integrado-final.png):
  creación de pedido desde Gateway con JWT, gRPC y RabbitMQ.
- [`flujo-integrado-rabbitmq-inventario.txt`](avance3-evidencias/flujo-integrado-rabbitmq-inventario.txt) y [`rabbitmq-recibido-inventario.png`](avance3-evidencias/rabbitmq-recibido-inventario.png):
  log del evento RabbitMQ consumido por Inventario.
- [`error-controlado-status.txt`](avance3-evidencias/error-controlado-status.txt):
  error controlado usado para observabilidad.
- [`avance3-sentry-error-capturado.png`](avance3-evidencias/avance3-sentry-error-capturado.png):
  evento capturado en Sentry.
- [`avance3-sentry-tags-contexto.png`](avance3-evidencias/avance3-sentry-tags-contexto.png):
  tags y contexto del evento en Sentry.
- [`avance3-kanban.png`](avance3-evidencias/avance3-kanban.png):
  captura del tablero Kanban actualizado para el cierre final.

![Kanban Avance 3](avance3-evidencias/avance3-kanban.png)

### Planificación

Carpeta: [`planificacion-avance3/`](planificacion-avance3/)

Contiene:

- runbook de demo;
- guion de defensa;
- planificación de cierre final.

### Fixes de arranque

Carpeta: [`avance3-evidencias/fix/`](avance3-evidencias/fix/)

Contiene la trazabilidad de las correcciones aplicadas después de la
retroalimentación del Avance 2 para arrancar el Avance 3 con el repositorio
final alineado:

- [`correcciones-avance2.md`](avance3-evidencias/fix/correcciones-avance2.md):
  hallazgos corregidos y estado.
- [`fix-rama-avance3.png`](avance3-evidencias/fix/fix-rama-avance3.png):
  rama de trabajo y estado Git limpio luego de los fixes.
- [`fix-docker-healthy.png`](avance3-evidencias/fix/fix-docker-healthy.png):
  stack Docker levantado después de aplicar las correcciones.
- [`fix-pedido-exitoso.png`](avance3-evidencias/fix/fix-pedido-exitoso.png):
  pedido exitoso validado como punto de partida del Avance 3.
- [`fix-error-controlado.png`](avance3-evidencias/fix/fix-error-controlado.png):
  error controlado por producto inexistente.
- [`fix-rabbitmq-consumo.png`](avance3-evidencias/fix/fix-rabbitmq-consumo.png):
  consumo RabbitMQ confirmado por MS Inventario.
