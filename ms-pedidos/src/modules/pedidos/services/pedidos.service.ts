import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { join } from 'path';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearPedidoDto, ActualizarEstadoDto } from '../dto/pedido.dto';
import axios, { AxiosError } from 'axios';
import { ClientGrpc, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom, Observable, timeout } from 'rxjs';

const MS_INVENTARIO_URL = process.env.MS_INVENTARIO_URL ?? 'http://localhost:3003';

type ProductoGrpcResponse = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  categoriaNombre: string;
  disponible: boolean;
};

type ProductosGrpcService = {
  obtenerProducto(data: { id: string }): Observable<ProductoGrpcResponse>;
};

type ItemPedidoConSnapshot = {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
};

/**
 * SRP: lógica de pedidos únicamente.
 * Coordina con MS Inventario para validar y descontar stock.
 */
@Injectable()
export class PedidosService implements OnModuleInit {
  private productosGrpc: ProductosGrpcService;
  private rabbitClient: ClientProxy;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const grpcClient = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'productos',
        protoPath: join(__dirname, '../../../../../proto/productos.proto'),
        url: process.env.GRPC_PRODUCTOS_URL ?? 'localhost:50051',
      },
    }) as unknown as ClientGrpc;

    this.productosGrpc = grpcClient.getService<ProductosGrpcService>('ProductosGrpcService');

    this.rabbitClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
        queue: process.env.RABBITMQ_PEDIDOS_QUEUE ?? 'cafe_campus_pedidos',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

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
    // 1. Obtener snapshots reales desde MS Productos por gRPC
    const items = await this.obtenerSnapshotsProductos(dto.items);

    // 2. Validar stock con MS Inventario antes de confirmar
    await this.validarStock(items);

    // 3. Calcular total con precios del MS Productos, no con datos del cliente
    const total = items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0,
    );

    // 4. Crear pedido en transacción
    const pedido = await this.prisma.pedido.create({
      data: {
        usuarioId,
        total,
        items: {
          create: items.map((item) => ({
            productoId: item.productoId,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
          })),
        },
      },
      include: { items: true },
    });

    // 5. Publicar evento RabbitMQ para evidenciar segundo transporte asíncrono
    await this.publicarPedidoCreadoRabbitMQ(pedido.id, usuarioId, total, items).catch((err) => {
      console.error('Error al publicar evento RabbitMQ:', err);
    });

    // 6. Descontar stock en MS Inventario (fire and forget con manejo de error)
    await this.descontarStock(pedido.id, items).catch((err) => {
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

  private async publicarPedidoCreadoRabbitMQ(
    pedidoId: string,
    usuarioId: string,
    total: number,
    items: ItemPedidoConSnapshot[],
  ) {
    await firstValueFrom(
      this.rabbitClient
        .emit('pedido.creado.rabbitmq', {
          pedidoId,
          usuarioId,
          total,
          items,
          creadoEn: new Date().toISOString(),
        })
        .pipe(timeout(1500)),
    );
  }

  private async obtenerSnapshotsProductos(
    items: CrearPedidoDto['items'],
  ): Promise<ItemPedidoConSnapshot[]> {
    try {
      return await Promise.all(
        items.map(async (item) => {
          const producto = await firstValueFrom(
            this.productosGrpc.obtenerProducto({ id: item.productoId }).pipe(timeout(3000)),
          );

          if (!producto.disponible) {
            throw new Error(`Producto ${producto.nombre} no está disponible`);
          }

          return {
            productoId: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: item.cantidad,
          };
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo obtener información del producto por gRPC';

      throw new HttpException(
        `Error gRPC al consultar producto: ${message}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private async validarStock(items: Array<{ productoId: string; cantidad: number }>) {
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

  private async descontarStock(
    pedidoId: string,
    items: Array<{ productoId: string; cantidad: number }>,
  ) {
    await axios.post(`${MS_INVENTARIO_URL}/inventario/descontar`, {
      pedidoId,
      items: items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
    });
  }
}
