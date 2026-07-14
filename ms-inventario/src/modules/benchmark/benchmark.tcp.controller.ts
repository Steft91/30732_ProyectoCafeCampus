import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

type BenchmarkPayload = {
  productoId: string;
  cantidad: number;
};

@Controller()
export class BenchmarkTcpController {
  @MessagePattern('benchmark.stock-check')
  async checkStock(@Payload() payload: BenchmarkPayload) {
    await this.delay(Number(process.env.BENCHMARK_INVENTARIO_DELAY_MS ?? 60));

    return {
      servicio: 'ms-inventario',
      paso: 'stock validado por TCP',
      disponible: true,
      productoId: payload.productoId,
      cantidadSolicitada: payload.cantidad,
    };
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
