# Guion de defensa - Avance 3 Final

## 1. Portada

Cafe Campus: sistema de gestion para cafeteria universitaria.

## 2. Dominio del MVP

El sistema permite administrar productos, pedidos e inventario de una cafeteria
universitaria. El foco del proyecto es demostrar arquitectura distribuida,
transportes, seguridad y observabilidad.

## 3. Arquitectura general

- Frontend Angular como interfaz de demo por rol.
- API Gateway como entrada unica para el frontend y las pruebas por API.
- MS Productos para catalogo.
- MS Pedidos para registrar compras.
- MS Inventario para stock y movimientos.
- PostgreSQL con schemas separados.
- TCP, Redis, gRPC y RabbitMQ como transportes internos.

## 4. Avance 1

Se comparo comunicacion sincrona con TCP frente a publicacion asincrona con
Redis. El hallazgo principal fue que la latencia sincrona se acumula por cada
salto y que el emisor asincrono responde mas rapido porque no espera al
consumidor.

## 5. Avance 2

Se agrego gRPC entre Pedidos y Productos para consultar datos reales del
producto mediante contrato `.proto`. Tambien se agrego RabbitMQ para publicar
eventos de pedido creado hacia Inventario.

## 6. Avance 3

Se valida seguridad con JWT y Guards por rol:

- login emite token;
- sin token responde 401;
- rol insuficiente responde 403;
- rol autorizado responde 200.

Sentry captura errores relevantes para demostrar observabilidad.

Ademas, el demo final incluye una interfaz Angular con tres roles:

- estudiante: crea pedidos y revisa estado;
- mesero: atiende pedidos y cambia estados;
- admin: administra productos y supervisa pedidos.

## 7. Temas de clase aplicados

- API Gateway.
- Guards y JWT.
- DTOs y validacion.
- Excepciones controladas.
- Comunicacion sincrona y asincrona.
- gRPC con contrato.
- Colas/eventos con RabbitMQ.
- Observabilidad con Sentry.
- Interfaz Angular conectada al Gateway.

## 8. Demo en vivo

Seguir [`01-runbook-demo.md`](01-runbook-demo.md).

## 9. Conclusiones

El proyecto muestra que cada transporte sirve para un caso distinto:

- HTTP para entrada y pruebas simples.
- TCP para comunicacion interna sincrona.
- Redis para publicacion rapida sin persistencia.
- gRPC para contratos tipados entre servicios.
- RabbitMQ para eventos desacoplados con cola.

JWT y Guards agregan control de acceso desde el Gateway, y Sentry permite
detectar errores durante la ejecucion.
