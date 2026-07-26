# Planificacion - Avance 3 Final

Documentacion de cierre para seguridad, observabilidad, integracion y defensa
del sistema Cafe Campus.

## Objetivo

Cerrar el proyecto con evidencia de:

1. Autenticacion JWT desde el Gateway.
2. Autorizacion con Guards y roles.
3. Observabilidad con Sentry.
4. Flujo integrado entre microservicios y transportes.
5. Interfaz Angular para demostrar el uso por rol en el demo final.
6. README final, evidencias, tablero Kanban y tag `v3-final`.

## Alcance tecnico

| Requisito | Implementacion esperada |
|---|---|
| Login JWT | `POST /api/auth/login` valida usuario mock y emite token firmado. |
| 401 | Rutas protegidas sin token o con token invalido. |
| 403 | Token valido con rol insuficiente para la ruta. |
| Sentry | Captura de excepciones con contexto minimo de ruta, metodo y servicio. |
| Integracion final | Crear pedido desde Gateway: JWT -> Pedidos -> Productos gRPC -> RabbitMQ -> Inventario. |
| Compose final | `docker-compose.final.yml` con PostgreSQL, Redis, RabbitMQ, Gateway y microservicios. |
| Frontend | Angular con login demo para estudiante, mesero y admin; consume el Gateway en `http://localhost:3000/api`. |
| Rol estudiante | Consulta menu disponible, arma carrito, crea pedidos y revisa el ultimo estado. |
| Rol mesero | Consulta pedidos y avanza estados operativos. |
| Rol admin | Administra productos del catalogo y supervisa pedidos. |

## Evidencias esperadas

Guardar en `docs/avance3-evidencias/`:

- `login-jwt.txt`
- `ruta-protegida-200.txt`
- `ruta-sin-token-401.txt`
- `ruta-rol-sin-permiso-403.txt`
- `flujo-integrado-final.txt`
- `avance3-sentry-error-capturado.png`
- `avance3-sentry-tags-contexto.png`
- `avance3-kanban.png`
- capturas equivalentes en `.png` si se requiere evidencia visual del frontend.

## Documentos

| Documento | Uso |
|---|---|
| [`01-runbook-demo.md`](01-runbook-demo.md) | Pasos de ejecucion y pruebas para la demo final. |
| [`02-guion-defensa.md`](02-guion-defensa.md) | Guion corto para explicar arquitectura, avances y decisiones. |
