import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando datos de productos...');

  // Categorías (upsert seguro por nombre único)
  const bebidas = await prisma.categoria.upsert({
    where: { nombre: 'Bebidas calientes' },
    update: {},
    create: { nombre: 'Bebidas calientes' },
  });

  const frias = await prisma.categoria.upsert({
    where: { nombre: 'Bebidas frías' },
    update: {},
    create: { nombre: 'Bebidas frías' },
  });

  const postres = await prisma.categoria.upsert({
    where: { nombre: 'Postres' },
    update: {},
    create: { nombre: 'Postres' },
  });

  const snacks = await prisma.categoria.upsert({
    where: { nombre: 'Snacks' },
    update: {},
    create: { nombre: 'Snacks' },
  });

  // Limpia productos previos y vuelve a insertar
  await prisma.producto.deleteMany();

  const productos = [
    { nombre: 'Cappuccino',              descripcion: 'Espresso con leche vaporizada y espuma',      precio: 2.50, categoriaId: bebidas.id },
    { nombre: 'Café Americano',          descripcion: 'Espresso con agua caliente',                   precio: 1.80, categoriaId: bebidas.id },
    { nombre: 'Latte',                   descripcion: 'Espresso con leche vaporizada',                precio: 2.75, categoriaId: bebidas.id },
    { nombre: 'Chocolate caliente',      descripcion: 'Chocolate con leche entera',                   precio: 2.20, categoriaId: bebidas.id },
    { nombre: 'Té verde',               descripcion: 'Té verde aromático con miel',                  precio: 1.50, categoriaId: bebidas.id },
    { nombre: 'Frappé de café',         descripcion: 'Café frío batido con hielo y crema',           precio: 3.00, categoriaId: frias.id  },
    { nombre: 'Limonada',               descripcion: 'Limonada fresca con menta',                    precio: 1.75, categoriaId: frias.id  },
    { nombre: 'Smoothie de frutas',     descripcion: 'Mezcla de frutas tropicales',                  precio: 2.80, categoriaId: frias.id  },
    { nombre: 'Brownie',                descripcion: 'Brownie de chocolate con nueces',              precio: 1.90, categoriaId: postres.id },
    { nombre: 'Cheesecake',             descripcion: 'Cheesecake de frutos rojos',                   precio: 2.50, categoriaId: postres.id },
    { nombre: 'Muffin de arándanos',    descripcion: 'Muffin esponjoso con arándanos frescos',       precio: 1.60, categoriaId: postres.id },
    { nombre: 'Croissant de mantequilla', descripcion: 'Croissant hojaldrado recién horneado',       precio: 1.80, categoriaId: postres.id },
    { nombre: 'Sándwich de pollo',      descripcion: 'Sándwich integral con pollo a la plancha',     precio: 3.20, categoriaId: snacks.id  },
    { nombre: 'Tostada con aguacate',   descripcion: 'Pan tostado con aguacate y tomate cherry',     precio: 2.90, categoriaId: snacks.id  },
    { nombre: 'Empanada de queso',      descripcion: 'Empanada horneada rellena de queso',           precio: 1.40, categoriaId: snacks.id  },
  ];

  await prisma.producto.createMany({ data: productos });

  console.log(`✓ ${productos.length} productos creados en 4 categorías`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
