import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  EntradaStockDto,
  AjusteStockDto,
  InicializarStockDto,
  ValidarStockDto,
  DescontarStockDto,
} from '../dto/inventario.dto';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stock.findMany({
      include: { movimientos: { orderBy: { creadoEn: 'desc' }, take: 5 } },
      orderBy: { actualizadoEn: 'desc' },
    });
  }

  async findByProducto(productoId: string) {
    const stock = await this.prisma.stock.findUnique({
      where: { productoId },
      include: { movimientos: { orderBy: { creadoEn: 'desc' } } },
    });

    if (!stock) {
      throw new NotFoundException(`Stock para producto ${productoId} no encontrado`);
    }

    return stock;
  }

  async findBajoStock() {
    // Devuelve todos los registros donde la cantidad es menor o igual al mínimo
    return this.prisma.stock.findMany({
      where: {
        cantidad: { lte: this.prisma.stock.fields.minimo },
      },
    });
  }

  async findMovimientos(productoId: string) {
    const stock = await this.prisma.stock.findUnique({ where: { productoId } });

    if (!stock) {
      throw new NotFoundException(`Stock para producto ${productoId} no encontrado`);
    }

    return this.prisma.movimiento.findMany({
      where: { stockId: stock.id },
      orderBy: { creadoEn: 'desc' },
    });
  }

  /** Se llama desde MS Productos al crear un producto nuevo */
  async inicializar(dto: InicializarStockDto) {
    const existe = await this.prisma.stock.findUnique({
      where: { productoId: dto.productoId },
    });

    if (existe) {
      throw new ConflictException(`Stock para producto ${dto.productoId} ya existe`);
    }

    return this.prisma.stock.create({
      data: {
        productoId: dto.productoId,
        cantidad: dto.cantidad,
        minimo: dto.minimo ?? 5,
        movimientos: {
          create: {
            tipo: 'ENTRADA',
            cantidad: dto.cantidad,
            motivo: 'Inicialización de stock',
          },
        },
      },
    });
  }

  async registrarEntrada(dto: EntradaStockDto) {
    const stock = await this.obtenerStock(dto.productoId);

    return this.prisma.$transaction(async (tx) => {
      await tx.movimiento.create({
        data: {
          stockId: stock.id,
          tipo: 'ENTRADA',
          cantidad: dto.cantidad,
          motivo: dto.motivo ?? 'Entrada de stock',
        },
      });

      return tx.stock.update({
        where: { id: stock.id },
        data: { cantidad: { increment: dto.cantidad } },
      });
    });
  }

  async registrarAjuste(dto: AjusteStockDto) {
    const stock = await this.obtenerStock(dto.productoId);

    const nuevaCantidad = stock.cantidad + dto.cantidad;
    if (nuevaCantidad < 0) {
      throw new UnprocessableEntityException(
        `Ajuste inválido: el stock quedaría en ${nuevaCantidad}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.movimiento.create({
        data: {
          stockId: stock.id,
          tipo: 'AJUSTE',
          cantidad: dto.cantidad,
          motivo: dto.motivo,
        },
      });

      return tx.stock.update({
        where: { id: stock.id },
        data: { cantidad: { increment: dto.cantidad } },
      });
    });
  }

  /**
   * Llamado por MS Pedidos antes de confirmar un pedido.
   * Verifica que haya stock suficiente para todos los items.
   * No descuenta — solo valida.
   */
  async validarStock(dto: ValidarStockDto): Promise<{ valido: true }> {
    const errores: string[] = [];

    for (const item of dto.items) {
      const stock = await this.prisma.stock.findUnique({
        where: { productoId: item.productoId },
      });

      if (!stock) {
        errores.push(`Producto ${item.productoId} no tiene stock registrado`);
        continue;
      }

      if (stock.cantidad < item.cantidad) {
        errores.push(
          `Producto ${item.productoId}: stock disponible ${stock.cantidad}, solicitado ${item.cantidad}`,
        );
      }
    }

    if (errores.length > 0) {
      throw new UnprocessableEntityException(errores.join(' | '));
    }

    return { valido: true };
  }

  /**
   * Llamado por MS Pedidos después de confirmar un pedido.
   * Descuenta el stock y registra el movimiento de salida.
   */
  async descontarStock(dto: DescontarStockDto) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const stock = await tx.stock.findUnique({
          where: { productoId: item.productoId },
        });

        if (!stock) continue;

        await tx.movimiento.create({
          data: {
            stockId: stock.id,
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            motivo: `Pedido #${dto.pedidoId}`,
          },
        });

        await tx.stock.update({
          where: { id: stock.id },
          data: { cantidad: { decrement: item.cantidad } },
        });
      }
    });
  }

  private async obtenerStock(productoId: string) {
    const stock = await this.prisma.stock.findUnique({ where: { productoId } });

    if (!stock) {
      throw new NotFoundException(
        `No existe registro de stock para el producto ${productoId}. Inicialícelo primero.`,
      );
    }

    return stock;
  }
}
