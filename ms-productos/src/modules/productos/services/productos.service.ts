import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearProductoDto, ActualizarProductoDto } from '../dto/producto.dto';

/**
 * SRP: este servicio solo maneja la lógica de productos.
 * ISP: expone métodos específicos que los controladores necesitan.
 */
@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findDisponibles() {
    return this.prisma.producto.findMany({
      where: { disponible: true },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return producto;
  }

  async create(dto: CrearProductoDto) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con id ${dto.categoriaId} no encontrada`);
    }

    return this.prisma.producto.create({
      data: dto,
      include: { categoria: true },
    });
  }

  async update(id: string, dto: ActualizarProductoDto) {
    await this.findOne(id); // lanza 404 si no existe

    return this.prisma.producto.update({
      where: { id },
      data: dto,
      include: { categoria: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.producto.delete({ where: { id } });
  }

  async toggleDisponibilidad(id: string) {
    const producto = await this.findOne(id);

    return this.prisma.producto.update({
      where: { id },
      data: { disponible: !producto.disponible },
    });
  }
}
