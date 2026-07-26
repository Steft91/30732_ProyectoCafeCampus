# Roles, actividades y Kanban — Avance 3 Final

Equipo de **3 integrantes**. Se mantiene la **propiedad por directorio** de los avances previos y se
reparte el trabajo de forma **equitativa**: cada integrante toma **dos ramas de peso comparable**, de
modo que nadie quede solo con documentación mientras otro concentra todo el código.

## Integrantes y responsabilidades

| Integrante         | Rol en Avance 3                                                | Directorios/archivos propios                                                                                 | Ramas                                                |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **Marcos Escobar** | Infraestructura final · Seguridad + Observabilidad del Gateway | `docker-compose.final.yml`, `docker-compose.yml` · `gateway/` (JWT config + Sentry)                          | `chore/compose-final`, `feat/jwt-sentry-gateway`     |
| **Mateo Sosa**     | Endurecimiento de servicios · Andamiaje del frontend           | `ms-productos/`, `ms-pedidos/`, `ms-inventario/` (filtros RPC + arranque) · `frontend/` (config + identidad) | `feat/rpc-exception-hardening`, `feat/frontend-base` |
| **Stefany Díaz**   | Interfaz por roles · Documentación · QA · Evidencias           | `frontend/src/app/` + `frontend/src/main.ts` · `docs/`, `README.md`, `TABLERO_KANBAN.md`                     | `feat/frontend-roles`, `docs/avance3`                |

## Reparto de tarjetas del `TABLERO_KANBAN.md` (etiqueta `avance-3`)

| Tarjeta Kanban (Avance 3)                                                        | Responsable      | Rama donde se resuelve         |
| -------------------------------------------------------------------------------- | ---------------- | ------------------------------ |
| `docker-compose.final.yml` con JWT/Sentry y puertos sin conflicto                | Marcos           | `chore/compose-final`          |
| Alinear `docker-compose.yml` (arranque robusto de servicios)                     | Marcos           | `chore/compose-final`          |
| JWT: expiración configurable por `JWT_EXPIRES_IN`                                | Marcos           | `feat/jwt-sentry-gateway`      |
| Sentry: `initSentry` + `SentryExceptionFilter` en el Gateway                     | Marcos           | `feat/jwt-sentry-gateway`      |
| Filtros `RpcException` en los 3 microservicios                                   | Mateo            | `feat/rpc-exception-hardening` |
| Arranque robusto de transportes (`main.ts` de los 3 servicios)                   | Mateo            | `feat/rpc-exception-hardening` |
| Configurar proyecto Angular (config, tsconfig, estilos base)                     | Mateo            | `feat/frontend-base`           |
| Identidad visual (logo, hero, estilos)                                           | Mateo            | `feat/frontend-base`           |
| Interfaz por rol estudiante (menú, carrito, crear pedido, estado)                | Stefany          | `feat/frontend-roles`          |
| Interfaz por rol mesero/admin (atención de pedidos, administración de productos) | Stefany          | `feat/frontend-roles`          |
| Evidencias: login/JWT, 200/401/403, Sentry, flujo integrado                      | Stefany          | `docs/avance3`                 |
| Runbook de demo + documentación de apoyo para defensa                            | Stefany          | `docs/avance3`                 |
| README final consolidado + diagrama v3 + Kanban                                  | Stefany          | `docs/avance3`                 |
| Tag `v3-final`                                                                   | Marcos (release) | sobre `main`                   |

## Tablero Markdown sugerido al cierre del Avance 3

| Backlog | Por hacer      | En progreso | En revisión | Hecho                                  |
| ------- | -------------- | ----------- | ----------- | -------------------------------------- |
| —       | Tag `v3-final` | —           | —           | Compose final (JWT/Sentry, puertos)    |
| —       | —              | —           | —           | JWT configurable + Guards 401/403      |
| —       | —              | —           | —           | Sentry integrado y evidenciado         |
| —       | —              | —           | —           | Filtros RPC + arranque robusto         |
| —       | —              | —           | —           | Frontend base (Angular + identidad)    |
| —       | —              | —           | —           | Frontend por roles                     |
| —       | —              | —           | —           | Flujo integrado JWT+gRPC+RabbitMQ      |
| —       | —              | —           | —           | README final + runbook + defensa + tag |

## Cómo se conecta con GitHub Flow

- `main` protegida; cada tarjeta en su rama `feat/…`, `chore/…`, `docs/…`.
- Cada rama se integra por **Pull Request** revisado por otro integrante (revisores rotan para
  trazabilidad — criterio C4).
- Un **tag por avance**: `v3-final` tras fusionar todo.
