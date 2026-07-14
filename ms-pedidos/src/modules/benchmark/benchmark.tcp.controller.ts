import { Controller, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

type BenchmarkPayload = {
  productoId: string;
  cantidad: number;
};

@Controller()
export class BenchmarkTcpController {
  private readonly inventarioTcpClient: ClientProxy;

  constructor() {
    this.inventarioTcpClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.MS_INVENTARIO_TCP_HOST ?? 'localhost',
        port: Number(process.env.MS_INVENTARIO_TCP_PORT ?? 4003),
      },
    });
  }

  @MessagePattern('benchmark.sync')
  async sync(@Payload() payload: BenchmarkPayload) {
    await this.delay(Number(process.env.BENCHMARK_PEDIDOS_DELAY_MS ?? 40));

    try {
      const inventario = await firstValueFrom(
        this.inventarioTcpClient
          .send('benchmark.stock-check', payload)
          .pipe(timeout(2500)),
      );

      return {
        servicio: 'ms-pedidos',
        paso: 'pedido validado y stock consultado',
        inventario,
      };
    } catch {
      throw new ServiceUnavailableException('MS Inventario no respondió por TCP');
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
