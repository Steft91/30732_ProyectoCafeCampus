# Patrones y principios de diseño aplicados — Avance 3 (criterio C4)

Se distingue lo que **aporta el framework "gratis"** (NestJS / Angular) de lo que **diseñó el equipo**
en este avance. Los patrones de avances 1 y 2 (API Gateway, Proxy, Pub/Sub, gRPC con contrato, DTO+
Validación, Exception Filters de dominio) se conservan; aquí se listan **los del Avance 3**.

## Patrones de diseño (nuevos en Avance 3)

| Patrón | ¿Framework o equipo? | Dónde se evidencia | Qué resuelve |
|---|---|---|---|
| **Guard (Chain of Responsibility)** | Equipo (sobre `CanActivate` de NestJS) | `gateway/.../guards/jwt-auth.guard.ts` (autenticación) + `roles.guard.ts` (autorización) | Cada request pasa por una cadena de guards: primero valida el JWT (401), luego el rol (403), antes de llegar al controlador. |
| **Decorador de metadatos** | Equipo (con `Reflector`) | `common/decorators/roles.decorator.ts` (`@Roles`) + `usuario-actual.decorator.ts` (`@UsuarioActual`) | Declara requisitos de rol por endpoint y extrae el usuario del request de forma declarativa. |
| **Exception Filter global (observabilidad)** | Equipo (sobre `ExceptionFilter`) | `gateway/.../filters/sentry-exception.filter.ts` | Punto único que traduce excepciones a respuesta HTTP **y** las reporta a Sentry con tags/contexto. |
| **Anti-Corruption / RpcException Filter** | Equipo | `ms-*/src/common/filters/rpc-exception.filter.ts` (`@Catch(RpcException)`) | Normaliza los errores que salen por transportes RPC (gRPC/TCP) para que no tumben el arranque ni filtren detalles del transporte. |
| **Token / Credential (JWT)** | Equipo (con `@nestjs/jwt`) | `gateway/.../auth/auth.service.ts` (`jwtService.sign`) + `JwtModule.register` (secret + `expiresIn`) | Estado de sesión sin servidor: el token firmado transporta `sub`, `email`, `rol` y expira según `JWT_EXPIRES_IN`. |
| **Adapter de configuración por entorno** | Equipo | `docker-compose.final.yml` + `.env.example` (JWT/Sentry/puertos) | Misma imagen, distinto entorno: puertos alternos y credenciales/DSN inyectados por variables. |
| **SPA + State con Signals** | Framework Angular, usado por el equipo | `frontend/src/app/app.component.ts` (`signal`, `computed`, `inject`) | UI reactiva por rol (`puedeComprar`/`puedeAtender`/`puedeAdministrar`) contra el Gateway. |

## Principios SOLID / de arquitectura (aplicados en Avance 3)

| Principio | Dónde | Justificación |
|---|---|---|
| **SRP (Responsabilidad Única)** | `AuthService` (solo autenticación) · `JwtAuthGuard` (solo token) · `RolesGuard` (solo rol) · `sentry.ts` (solo init) | Cada pieza de seguridad/observabilidad hace una sola cosa; el comentario en `auth.service.ts` deja explícito que el mock se reemplaza por auth real sin tocar el resto. |
| **OCP (Abierto/Cerrado)** | `SentryExceptionFilter` y `RpcExceptionFilter` se **agregan** sin modificar los controladores | La observabilidad y el endurecimiento se enganchan como filtros globales, sin reescribir la lógica existente. |
| **DIP (Inversión de Dependencias)** | Guards y filtros dependen de abstracciones inyectadas (`JwtService`, `Reflector`) | Facilita sustituir el proveedor de auth (mock → OAuth2/Auth0) sin afectar a los consumidores. |
| **Separación de capas** | Frontend (Angular) ↔ Gateway (auth/proxy) ↔ servicios ↔ datos | El frontend nunca habla con un microservicio directamente: solo con el Gateway, que centraliza JWT, roles y CORS. |
| **Observabilidad como preocupación transversal** | Sentry con tags (`service`, `http.status_code`) y contexto (`method`, `url`) | El registro de errores es transversal (cross-cutting), resuelto con un filtro en el borde y no disperso en cada handler. |

## Síntesis de decisiones de diseño

- Lo que **el framework proporciona**: `CanActivate`/`ExceptionFilter`/`Reflector` y `@nestjs/jwt` en
  NestJS; `signal`/`computed`/`HttpClient` en Angular; el SDK `@sentry/node`.
- Lo que **fue definido por el equipo**: la **cadena JwtAuthGuard → RolesGuard** con `@Roles` por
  endpoint (401 vs 403), el **filtro global de Sentry** que decide qué capturar (`>=500` o
  `SENTRY_CAPTURE_HTTP_ERRORS`), los **filtros `RpcException`** que endurecen el arranque de los tres
  servicios, el **compose final** parametrizado por entorno con puertos sin conflicto, y una **SPA por
  rol** que consume exclusivamente el Gateway.
