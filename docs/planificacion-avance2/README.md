# Planificación — Avance 2 (Cafe Campus)

Documentación técnica y organizativa correspondiente al segundo avance de Cafe Campus.
Se presentan la distribución de responsabilidades, la arquitectura de comunicación ampliada
(**gRPC** + **RabbitMQ**), los patrones de diseño aplicados y el manejo de excepciones,
junto con la comparación de los cuatro transportes utilizados en el proyecto.

Equipo de 3 integrantes: **Marcos Escobar**, **Mateo Sosa** y **Stefany Díaz**.

## Objetivo del avance

Enriquecer la comunicación del MVP con **dos temas del curso** sin romper lo entregado en Avance 1:

1. **gRPC** entre `ms-pedidos` (cliente) y `ms-productos` (servidor), con contrato `.proto` en el monorepo.
2. **RabbitMQ** como **segundo transporte asíncrono** (cola durable), distinto a Redis Pub/Sub.
3. **Manejo de excepciones** consistente en la capa de servicios para los nuevos caminos (error gRPC controlado que no tumba el servicio).

El camino síncrono **TCP** y el asíncrono **Redis** del Avance 1 **se conservan** como evidencia previa.

| Documento | Contenido |
|---|---|
| [`arquitectura-avance2.puml`](arquitectura-avance2.puml) | **Fuente** del diagrama de arquitectura (PlantUML): gRPC + RabbitMQ sobre TCP/Redis. |
| [`arquitectura-avance2.png`](arquitectura-avance2.png) · [`.svg`](arquitectura-avance2.svg) | Diagrama **exportado** (el PNG es el que se enlaza en el README). |
| [`01-roles-y-kanban.md`](01-roles-y-kanban.md) | Roles, propiedad por directorio y reparto de tarjetas Kanban del Avance 2. |
| [`02-patrones-y-principios.md`](02-patrones-y-principios.md) | Patrones/principios aplicados (framework vs equipo) — criterio C4. |
| [`03-comparacion-transportes-excepciones.md`](03-comparacion-transportes-excepciones.md) | Comparación de los 4 transportes y estrategia de excepciones — criterios C2/C3. |


## Decisión técnica

| Requisito | Implementación | Motivo |
|---|---|---|
| gRPC (Tema 7) | `ms-pedidos` → `ms-productos` | Pedidos necesita `nombre`/`precio` **reales del servidor** antes de crear un pedido, no del cliente. |
| Segundo transporte | RabbitMQ (`amqp`) | Cola configurada como durable, con un flujo de consumo más controlado y mayor
capacidad de retención que Redis Pub/Sub. |
| Error controlado | Producto inexistente por gRPC | `RpcException(NOT_FOUND)` → HTTP `422` con `try/catch`, sin tumbar el servicio. |
| Evidencia | `curl`, logs y capturas en `docs/avance2-evidencias/` | La rúbrica exige pruebas visibles en el repositorio. |

## Cómo regenerar el diagrama

El PNG/SVG ya están exportados y versionados. Si se edita el `.puml`, **hay que regenerarlos**:

```bash
# Requiere: plantuml + java + graphviz (dot)
plantuml -tpng docs/planificacion-avance2/arquitectura-avance2.puml
plantuml -tsvg docs/planificacion-avance2/arquitectura-avance2.puml
```

Alternativas: extensión *PlantUML* en VS Code (`Alt+D` para previsualizar) o pegar el contenido
en <https://www.plantuml.com/plantuml>.

## Secuencia de trabajo

Marcos definió el contrato `.proto`, configuró la infraestructura y desarrolló
el servidor gRPC en MS Productos. Stefany implementó en MS Pedidos el cliente
gRPC, la obtención del snapshot del producto y la publicación del evento
RabbitMQ. Mateo implementó en MS Inventario el consumidor RabbitMQ.

Después de integrar las tres ramas de servicio, Stefany ejecutó las pruebas,
generó las evidencias, actualizó la documentación y realizará el cierre del
avance con el tag `v2-avance2`.