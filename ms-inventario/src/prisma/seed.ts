import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const productosUrl = process.env.MS_PRODUCTOS_URL ?? 'http://localhost:3001';

/**
 * Este seed consulta los productos del MS Productos para obtener sus IDs
 * y luego inicializa el stock de cada uno.
 * Asegúrate de que ms-productos esté corriendo antes de ejecutar este seed.
 */
async function main() {
  console.log('Sembrando datos de inventario...');

  // Obtener productos desde el MS Productos
  let productos: { id: string; nombre: string }[] = [];

  try {
    const response = await axios.get(`${productosUrl}/productos`);
    productos = response.data;
  } catch {
    console.error(`❌ No se pudo conectar al MS Productos en ${productosUrl}.`);
    process.exit(1);
  }

  if (productos.length === 0) {
    console.warn('⚠ No hay productos registrados. Ejecuta el seed de ms-productos primero.');
    process.exit(0);
  }

  // Stock inicial por nombre de producto
  const stockPorNombre: Record<string, { cantidad: number; minimo: number }> = {
    'Cappuccino':              { cantidad: 50, minimo: 10 },
    'Café Americano':          { cantidad: 60, minimo: 10 },
    'Latte':                   { cantidad: 45, minimo: 10 },
    'Chocolate caliente':      { cantidad: 40, minimo: 8  },
    'Té verde':                { cantidad: 30, minimo: 5  },
    'Frappé de café':          { cantidad: 35, minimo: 8  },
    'Limonada':                { cantidad: 40, minimo: 8  },
    'Smoothie de frutas':      { cantidad: 25, minimo: 5  },
    'Brownie':                 { cantidad: 20, minimo: 5  },
    'Cheesecake':              { cantidad: 15, minimo: 3  },
    'Muffin de arándanos':     { cantidad: 25, minimo: 5  },
    'Croissant de mantequilla':{ cantidad: 30, minimo: 5  },
    'Sándwich de pollo':       { cantidad: 20, minimo: 5  },
    'Tostada con aguacate':    { cantidad: 18, minimo: 4  },
    'Empanada de queso':       { cantidad: 35, minimo: 8  },
  };

  let creados = 0;

  for (const producto of productos) {
    const config = stockPorNombre[producto.nombre] ?? { cantidad: 20, minimo: 5 };

    const existe = await prisma.stock.findUnique({ where: { productoId: producto.id } });
    if (existe) {
      console.log(`  → Stock de "${producto.nombre}" ya existe, omitiendo`);
      continue;
    }

    await prisma.stock.create({
      data: {
        productoId: producto.id,
        cantidad: config.cantidad,
        minimo: config.minimo,
        movimientos: {
          create: {
            tipo: 'ENTRADA',
            cantidad: config.cantidad,
            motivo: 'Stock inicial',
          },
        },
      },
    });

    console.log(`  ✓ ${producto.nombre}: ${config.cantidad} unidades`);
    creados++;
  }

  console.log(`\n✓ Stock inicializado para ${creados} productos`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
