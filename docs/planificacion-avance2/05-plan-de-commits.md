# Plan de commits semánticos para fixes del Avance 2

Los cambios de corrección se trabajan en la rama `fix-avance-2` para recuperar
trazabilidad y separar cada responsabilidad en commits pequeños.

| Orden | Commit sugerido | Contenido |
|---:|---|---|
| 1 | `fix(exceptions): register rpc exception filters` | Implementa `RpcExceptionFilter` y lo registra en gRPC/TCP/Redis/RabbitMQ. |
| 2 | `docs(avance2): align correction notes and exception docs` | Actualiza docs de excepciones y crea los documentos de corrección/plan. |
| 3 | `docs(readme): embed avance2 evidence and sync tag date` | Embebe evidencias, Kanban y sincroniza metadata del tag. |
| 4 | `fix(compose): add broker healthchecks` | Añade healthchecks de Redis/RabbitMQ y dependencias `service_healthy`. |
| 5 | `docs(avance1): add zero-delay latency comparison` | Corrige el typo de latencia y documenta benchmark con delays en cero. |
| 6 | `fix(pedidos): compensate failed stock discount` | Marca el pedido como `CANCELADO` si falla el descuento posterior de stock. |
| 7 | `docs(fix): document exact avance2 changes` | Incluye el reporte exacto de cambios en la carpeta de evidencias `fix`. |

## Verificación antes de merge

1. `docker compose down -v`
2. `docker compose up -d`
3. `docker compose exec ms-productos npm run seed`
4. `docker compose exec ms-inventario npm run seed`
5. Probar pedido exitoso con un `productoId` real.
6. Probar error controlado con `producto-inexistente`.
7. Revisar `docker compose logs ms-inventario` para confirmar consumo RabbitMQ.
