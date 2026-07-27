import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcExceptionFilter } from '../../common/filters/rpc-exception.filter';

type BenchmarkPayload = {
  productoId: string;
  cantidad: number;
};

@Controller()
@UseFilters(new RpcExceptionFilter('tcp'))
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
