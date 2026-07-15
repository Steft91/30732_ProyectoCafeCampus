# Patrones y principios de diseño aplicados — Avance 1 (criterio C3)

Se distingue lo que **aporta NestJS "gratis"** (por convención del framework) de lo que
**diseñó el equipo** deliberadamente. Cada punto cita el archivo donde se evidencia.

## Patrones de diseño

| Patrón | ¿Framework o equipo? | Dónde se evidencia | Qué resuelve |
|---|---|---|---|
| **API Gateway** | Diseñado por el equipo (sobre Nest) | `gateway/` (punto único `/api`, JWT, ruteo) | Una sola entrada HTTP; centraliza auth y oculta la topología interna. |
| **Proxy** | Diseñado por el equipo | `gateway/src/modules/*/*-proxy.service.ts` | El gateway reenvía a cada microservicio por HTTP (axios) sin exponerlos directo. |
| **Publisher/Subscriber** | Equipo (usando transporte Redis de Nest) | `gateway/.../benchmark.service.ts` (`emit('pedido.creado.async')`) + `ms-inventario/.../benchmark.events.controller.ts` (`@EventPattern`) | Desacople temporal: el emisor publica y no espera al consumidor. |
| **Request/Response (RPC sobre TCP)** | Equipo (usando `@nestjs/microservices`) | `benchmark.tcp.controller.ts` (`@MessagePattern`) + cliente `ClientProxyFactory` | Cadena síncrona Gateway→Pedidos→Inventario para evidenciar acumulación de latencia. |
| **DTO + Validación** | Framework (`ValidationPipe`) usado deliberadamente por el equipo | `*/dto/*.dto.ts` + `main.ts` (`whitelist`, `forbidNonWhitelisted`, `transform`) | Valida y sanea entrada en el borde, fuera de la lógica de negocio. |
| **Inyección de dependencias (contenedor IoC)** | Framework | constructores `private readonly ...` en todos los `*.service.ts` | Nest resuelve y provee dependencias; facilita pruebas y desacople. |
| **Módulos (composición)** | Framework | `*.module.ts` de cada feature | Encapsula controladores/servicios por dominio. |
| **Excepciones HTTP y manejo controlado de errores** | Framework (jerarquía de excepciones) + equipo (uso deliberado)| `pedidos.service.ts` (`HttpException`, `NotFoundException`), `benchmark.service.ts` (`ServiceUnavailableException`) | Un error no derriba el proceso: se traduce a respuesta HTTP (422, 404, 503). |

## Principios SOLID / de arquitectura

| Principio | Dónde | Justificación |
|---|---|---|
| **SRP (Responsabilidad Única)** | cada microservicio y cada `service.ts` | Productos = catálogo, Pedidos = pedidos, Inventario = stock. `PedidosService` solo orquesta pedidos (comentado explícitamente en el archivo). |
| **Separación de responsabilidades (capas)** | `controllers/` ↔ `services/` ↔ `dto/` ↔ `prisma/` | El controlador enruta, el servicio decide, el DTO valida, Prisma persiste. |
| **Aislamiento de datos por servicio** | un `schema` de PostgreSQL por microservicio | Sin tablas compartidas; los IDs cruzados son lógicos, no FKs → bajo acoplamiento de datos. |
| **Manejo de excepciones en la capa de servicios** | `try/catch` en `validarStock`, `descontarStock`, `sync()`, `async()` | Los fallos de red aguas abajo se capturan y se responden controladamente (no crashea). |

## Síntesis de decisiones de diseño

- Lo que **NestJS proporciona mediante el framework**: IoC/DI, módulos, `ValidationPipe`,
  jerarquía de excepciones y transportes TCP/Redis de `@nestjs/microservices`.

- Lo que **fue definido por el equipo**: el uso de un API Gateway, los proxies HTTP,
  el contraste deliberado entre comunicación síncrona mediante TCP y comunicación
  asíncrona mediante Redis Pub/Sub para analizar latencia y acoplamiento, el aislamiento   de datos por schema y el manejo controlado de errores mediante respuestas 422, 404 y 503.