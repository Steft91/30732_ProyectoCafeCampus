import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class BenchmarkService {
  private readonly pedidosTcpClient: ClientProxy;
  private readonly redisClient: ClientProxy;

  constructor() {
    this.pedidosTcpClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.MS_PEDIDOS_TCP_HOST ?? 'localhost',
        port: Number(process.env.MS_PEDIDOS_TCP_PORT ?? 4002),
      },
    });

    this.redisClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    });
  }

  async sync() {
    const startedAt = Date.now();

    try {
      const response = await firstValueFrom(
        this.pedidosTcpClient
          .send('benchmark.sync', { productoId: 'demo-cappuccino', cantidad: 2 })
          .pipe(timeout(3000)),
      );

      return {
        camino: 'sincrono-tcp',
        descripcion: 'Gateway -> MS Pedidos -> MS Inventario',
        duracionMs: Date.now() - startedAt,
        response,
      };
    } catch {
      throw new ServiceUnavailableException(
        'Camino síncrono no disponible: MS Pedidos o MS Inventario no respondió',
      );
    }
  }

  async async() {
    const startedAt = Date.now();
    const evento = {
      pedidoId: `bench-${Date.now()}`,
      productoId: 'demo-cappuccino',
      cantidad: 2,
      creadoEn: new Date().toISOString(),
    };

    try {
      await firstValueFrom(
        this.redisClient.emit('pedido.creado.async', evento).pipe(timeout(1000)),
      );

      return {
        camino: 'asincrono-redis',
        descripcion: 'Gateway publica evento Redis; el consumidor procesa sin bloquear',
        aceptado: true,
        duracionMs: Date.now() - startedAt,
        evento,
      };
    } catch {
      throw new ServiceUnavailableException('Redis no está disponible para publicar eventos');
    }
  }
}
