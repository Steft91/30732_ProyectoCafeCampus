# Seguridad, observabilidad e integración final — Avance 3 (criterios C1/C2/C3)

Análisis de los tres pilares del cierre: **autenticación/autorización JWT** (C1/C2), **observabilidad
con Sentry** (C3) e **integración** de todos los transportes en un flujo real.

## 1. Autenticación y autorización JWT (C1/C2)

El Gateway es el **único punto** donde se aplica seguridad; los microservicios confían en él.

### Flujo

1. **Login** — `POST /api/auth/login` valida credenciales contra usuarios mock y **firma** un JWT con
   `sub`, `email`, `rol`; expira según `JWT_EXPIRES_IN` (`JwtModule.register`).
   Evidencia: `login-jwt.txt` → `HTTP 200` con `access_token`.
2. **Autenticación (401)** — `JwtAuthGuard` extrae el `Bearer` y hace `jwtService.verify`. Sin token o
   token inválido/expirado → **401**. Evidencia: `ruta-sin-token-401.txt` →
   `{"message":"Token no proporcionado",...,"statusCode":401}`.
3. **Autorización (403)** — `RolesGuard` lee `@Roles(...)` con `Reflector` y compara contra `user.rol`.
   Rol insuficiente → **403**. Evidencia: `ruta-rol-sin-permiso-403.txt`: un estudiante en `GET /api/pedidos`
   (solo `admin`/`personal`) recibe `{"message":"Se requiere uno de los siguientes roles: admin, personal",...,"statusCode":403}`.
4. **Acceso correcto (200)** — token válido + rol permitido → **200**. Evidencia: `ruta-protegida-200.txt`.

### Matriz de autorización (de `pedidos-proxy.controller.ts`)

| Ruta | Roles permitidos |
|---|---|
| `GET /api/pedidos` | `admin`, `personal` |
| `GET /api/pedidos/mis-pedidos` | `estudiante` |
| `POST /api/pedidos` | `estudiante` |
| `PATCH /api/pedidos/:id/estado` | `admin`, `personal` |
| `PATCH /api/pedidos/:id/cancelar` | `estudiante` |

**Autenticación vs autorización:** el `JwtAuthGuard` responde *quién eres* (401 si no se puede probar);
el `RolesGuard` responde *qué puedes hacer* (403 si el rol no alcanza). Se ejecutan en cadena y en ese
orden (`@UseGuards(JwtAuthGuard, RolesGuard)`).

## 2. Observabilidad con Sentry (C3)

`initSentry('gateway')` arranca el SDK solo si hay `SENTRY_DSN` (si no, es *no-op* — no rompe en local).
`SentryExceptionFilter` es un filtro global que, ante cualquier excepción:

- fija tags `service=gateway` y `http.status_code`, y contexto `{ method, url }`;
- llama a `Sentry.captureException` cuando el status es **≥ 500** o `SENTRY_CAPTURE_HTTP_ERRORS=true`
  (así los 4xx esperados no ensucian el panel salvo que se pida explícitamente);
- responde igual el cuerpo de la `HttpException` para no alterar el contrato del cliente.

Evidencia: `avance3-sentry-error-capturado.png` y `avance3-sentry-tags-contexto.png` (error visible en
el panel con sus tags y contexto).

## 3. Integración final (C4) — todos los transportes en un flujo

Crear un pedido autenticado ejercita, en una sola operación, **JWT + HTTP + gRPC + RabbitMQ**:

```
Frontend/curl --(HTTP + Bearer JWT)--> Gateway  (JwtAuthGuard + RolesGuard: estudiante)
  Gateway --(HTTP proxy)--> MS Pedidos
    MS Pedidos --(gRPC ObtenerProducto)--> MS Productos   (nombre/precio reales)
    MS Pedidos --(HTTP validar stock)--> MS Inventario
    MS Pedidos --(persiste)--> PostgreSQL
    MS Pedidos --(emit pedido.creado.rabbitmq)--> RabbitMQ --> MS Inventario (@EventPattern)
  Gateway <-- pedido creado (201)
```

Evidencia: `flujo-integrado-final.txt` → `HTTP 201` con el pedido y su `item` (nombre/precio tomados de
Productos por gRPC: *Cappuccino / 2.5*); `flujo-integrado-rabbitmq-inventario.txt` /
`rabbitmq-recibido-inventario.png` muestran el evento consumido por Inventario.

Los **filtros `RpcException`** añadidos a los tres servicios (`@Catch(RpcException)`) evitan que un
error de transporte tumbe el arranque y dejan pasar el error de dominio; el `try/catch` del avance 2 lo
traduce a HTTP. Evidencia del error controlado: `error-controlado-status.txt` →
`"Error gRPC al consultar producto: 5 NOT_FOUND ..."` con `HTTP 422` (no cae el servicio).

## 4. Compose final y arranque robusto

`docker-compose.final.yml` levanta Postgres + Redis + RabbitMQ + Gateway + 3 servicios con variables de
JWT/Sentry y **puertos externos alternos** (Postgres `15432`, Redis `16379`, RabbitMQ `15674/15673`,
servicios `13001+`) para no chocar con procesos locales; los puertos internos no cambian.
Evidencia: `servicios-finales-ps.txt` / `servicios-finales.png`.

## Conclusión

El Avance 3 cierra el sistema con control de acceso en el borde (JWT para autenticar, Guards por rol
para autorizar, con 401/403 demostrados), observabilidad centralizada en un filtro que reporta a Sentry
con contexto útil, y un flujo integrado que recorre los cuatro transportes del proyecto sin que un
error controlado derribe ningún servicio. El frontend Angular hace tangible el uso por rol sobre esa
misma superficie del Gateway.
