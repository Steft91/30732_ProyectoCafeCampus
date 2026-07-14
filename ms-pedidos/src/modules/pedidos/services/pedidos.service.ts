import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearPedidoDto, ActualizarEstadoDto } from '../dto/pedido.dto';
import axios, { AxiosError } from 'axios';

const MS_INVENTARIO_URL = process.env.MS_INVENTARIO_URL ?? 'http://localhost:3003';

/**
 * SRP: lógica de pedidos únicamente.
 * Coordina con MS Inventario para validar y descontar stock.
 */
@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pedido.findMany({
      include: { items: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findByUsuario(usuarioId: string) {
    return this.prisma.pedido.findMany({
      where: { usuarioId },
      include: { items: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${id} no encontrado`);
    }

    return pedido;
  }

  async create(dto: CrearPedidoDto, usuarioId: string) {
    // 1. Validar stock con MS Inventario antes de confirmar
    await this.validarStock(dto.items);

    // 2. Calcular total
    const total = dto.items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0,
    );

    // 3. Crear pedido en transacción
    const pedido = await this.prisma.pedido.create({
      data: {
        usuarioId,
        total,
        items: {
          create: dto.items.map((item) => ({
            productoId: item.productoId,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
          })),
        },
      },
      include: { items: true },
    });

    // 4. Descontar stock en MS Inventario (fire and forget con manejo de error)
    await this.descontarStock(pedido.id, dto.items).catch((err) => {
      console.error('Error al descontar stock:', err);
      // El pedido ya fue creado; se podría implementar compensación aquí
    });

    return pedido;
  }

  async actualizarEstado(id: string, dto: ActualizarEstadoDto) {
    await this.findOne(id);

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: dto.estado },
      include: { items: true },
    });
  }

  async cancelar(id: string, usuarioId: string) {
    const pedido = await this.findOne(id);

    if (pedido.usuarioId !== usuarioId) {
      throw new BadRequestException('No puedes cancelar un pedido que no es tuyo');
    }

    if (pedido.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden cancelar pedidos en estado PENDIENTE');
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { estado: 'CANCELADO' },
    });
  }

  // --- Comunicación interna con MS Inventario ---

  private async validarStock(items: CrearPedidoDto['items']) {
    try {
      await axios.post(`${MS_INVENTARIO_URL}/inventario/validar`, {
        items: items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      const mensaje =
        (axiosError.response?.data as any)?.message ?? 'Stock insuficiente';
      throw new HttpException(mensaje, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  private async descontarStock(pedidoId: string, items: CrearPedidoDto['items']) {
    await axios.post(`${MS_INVENTARIO_URL}/inventario/descontar`, {
      pedidoId,
      items: items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
    });
  }
}
