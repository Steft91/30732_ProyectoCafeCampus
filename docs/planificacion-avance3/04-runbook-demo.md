# Runbook de demo - Avance 3

Guia corta para ensayar la exposicion final.

## 1. Levantar el sistema

```bash
cp .env.example .env
# Editar .env solo si se quiere activar Sentry o cambiar JWT/delays.
docker compose -f docker-compose.final.yml up -d
docker compose -f docker-compose.final.yml ps
```

Si la base esta nueva:

```bash
docker compose -f docker-compose.final.yml exec ms-productos npx prisma migrate deploy --schema src/prisma/schema.prisma
docker compose -f docker-compose.final.yml exec ms-pedidos npx prisma migrate deploy --schema src/prisma/schema.prisma
docker compose -f docker-compose.final.yml exec ms-inventario npx prisma migrate deploy --schema src/prisma/schema.prisma

docker compose -f docker-compose.final.yml exec ms-productos npm run seed
docker compose -f docker-compose.final.yml exec -e MS_PRODUCTOS_URL=http://ms-productos:3001 ms-inventario npm run seed
```

## 2. Levantar frontend de demo

El frontend no esta dentro del compose final; se ejecuta localmente para consumir el Gateway:

```bash
cd frontend
npm install
npm run start
```

Abrir `http://localhost:4200` y probar las cuentas demo:

| Rol | Correo | Clave | Flujo visible |
|---|---|---|---|
| Estudiante | `estudiante@campus.edu` | `est123` | Ver menu, agregar al carrito, crear pedido y consultar estado. |
| Mesero | `personal@campus.edu` | `personal123` | Ver pedidos y pasar de pendiente a preparacion/listo. |
| Admin | `admin@campus.edu` | `admin123` | Crear, pausar, activar, cambiar precio o eliminar productos. |

## 3. Login por API

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@campus.edu","password":"est123"}' | jq
```

## 4. Ruta protegida

Sin token debe responder `401`:

```bash
curl -s http://localhost:3000/api/pedidos | jq
```

Con token valido y rol permitido debe responder `200`:

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campus.edu","password":"admin123"}' | jq -r '.access_token')

curl -s http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

Con token valido pero rol insuficiente debe responder `403`:

```bash
ESTUDIANTE_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@campus.edu","password":"est123"}' | jq -r '.access_token')

curl -s http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN" | jq
```

## 5. Operacion integrada

Crear un pedido desde Gateway con token de estudiante. El flujo esperado es:

`Gateway -> MS Pedidos -> MS Productos por gRPC -> RabbitMQ -> MS Inventario`.

```bash
PRODUCTO_ID="PEGAR_ID_REAL_DE_PRODUCTOS"

curl -s -X POST http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      { \"productoId\": \"$PRODUCTO_ID\", \"cantidad\": 2 }
    ]
  }" | jq
```

Verificar evento:

```bash
docker compose -f docker-compose.final.yml logs --tail=80 ms-inventario
```

## 6. Sentry

Provocar un error controlado y verificarlo en el panel de Sentry.

```bash
curl -s -X POST http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer $ESTUDIANTE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productoId": "producto-inexistente", "cantidad": 1 }
    ]
  }' | jq
```
