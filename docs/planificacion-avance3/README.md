# Planificación — Avance 3 Final (Cafe Campus)

Documentación técnica y organizativa del cierre de Cafe Campus: **seguridad (JWT + Guards)**,
**observabilidad (Sentry)**, **integración final** de todos los transportes y **frontend Angular**
para la demo, más documentación de apoyo para la defensa ante el jurado.

Equipo de 3 integrantes: **Marcos Escobar**, **Mateo Sosa** y **Stefany Díaz**.

## Objetivo del avance

Cerrar el proyecto con calidad de entrega usando lo visto en clase, sin romper lo de avances previos:

1. **Autenticación JWT** en el Gateway: `POST /api/auth/login` emite token firmado (usuarios mock).
2. **Autorización con Guards**: `JwtAuthGuard` (sin/invalid token → **401**) + `RolesGuard` con
   `@Roles(...)` (rol insuficiente → **403**).
3. **Observabilidad con Sentry**: `SentryExceptionFilter` captura excepciones con tags y contexto.
4. **Integración final**: un pedido real atraviesa JWT → Pedidos → Productos (gRPC) → RabbitMQ →
   Inventario, con los transportes de avances 1 y 2 conservados y **filtros RPC** que endurecen el arranque.
5. **Frontend Angular**: SPA de demo con login por rol (estudiante / mesero / admin) que consume el Gateway.
6. README final consolidado, evidencias, tablero Kanban y **tag `v3-final`**.

| Documento                                                                                   | Contenido                                                                                               |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`arquitectura-avance3.puml`](arquitectura-avance3.puml)                                    | **Fuente** del diagrama final (PlantUML): frontend + JWT/Guards + Sentry sobre TCP/Redis/gRPC/RabbitMQ. |
| [`arquitectura-avance3.png`](arquitectura-avance3.png) · [`.svg`](arquitectura-avance3.svg) | Diagrama **exportado** (el PNG es el que se enlaza en el README).                                       |
| [`01-roles-y-kanban.md`](01-roles-y-kanban.md)                                              | Roles, propiedad por directorio y reparto **equitativo** de tarjetas Kanban del Avance 3.               |
| [`02-patrones-y-principios.md`](02-patrones-y-principios.md)                                | Patrones/principios aplicados (framework vs equipo) — criterio C4.                                      |
| [`03-seguridad-observabilidad-integracion.md`](03-seguridad-observabilidad-integracion.md)  | Análisis de JWT/Guards, Sentry e integración final — criterios C1/C2/C3.                                |
| [`04-runbook-demo.md`](04-runbook-demo.md)                                                  | Pasos de demo por consola e interfaz para validar seguridad, roles, Sentry y flujo integrado.           |

## Alcance técnico

| Requisito         | Implementación                                                                                | Evidencia                                                  |
| ----------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Login JWT         | `POST /api/auth/login` valida usuario mock y firma token (`JWT_EXPIRES_IN` configurable)      | `login-jwt.txt/.png`                                       |
| 401               | Ruta protegida sin token o token inválido (`JwtAuthGuard`)                                    | `ruta-sin-token-401.txt/.png`                              |
| 403               | Token válido con rol insuficiente (`RolesGuard` + `@Roles`)                                   | `ruta-rol-sin-permiso-403.txt/.png`                        |
| 200               | Ruta protegida con token y rol correcto                                                       | `ruta-protegida-200.txt` / `ruta-con-token-valido-200.png` |
| Sentry            | `SentryExceptionFilter` con tags (`service`, `http.status_code`) y contexto (`method`, `url`) | `avance3-sentry-*.png`                                     |
| Integración final | Pedido Gateway → Pedidos → Productos gRPC → RabbitMQ → Inventario                             | `flujo-integrado-final.txt/.png`                           |
| Compose final     | `docker-compose.final.yml` con JWT/Sentry y puertos sin conflicto                             | `servicios-finales-ps.txt/.png`                            |
| Frontend          | Angular SPA por rol conectada al Gateway (`http://localhost:3000/api`)                        | capturas del demo                                          |

## Cómo regenerar el diagrama

```bash
# Requiere: plantuml + java + graphviz (dot)
plantuml -tpng docs/planificacion-avance3/arquitectura-avance3.puml
plantuml -tsvg docs/planificacion-avance3/arquitectura-avance3.puml
```

## Secuencia de trabajo en una frase

Marcos congela la infraestructura final (compose con JWT/Sentry/puertos) y asegura el Gateway
(JWT + Sentry) → Mateo endurece los servicios (filtros RPC) y levanta el andamiaje del frontend →
Stefany implementa la interfaz por roles y documenta/evidencia todo → Marcos etiqueta `v3-final`.
