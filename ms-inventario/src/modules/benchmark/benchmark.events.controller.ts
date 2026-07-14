import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

type PedidoCreadoAsyncEvent = {
  pedidoId: string;
  productoId: string;
  cantidad: number;
  creadoEn: string;
};

@Controller()
export class BenchmarkEventsController {
  private readonly logger = new Logger(BenchmarkEventsController.name);

  @EventPattern('pedido.creado.async')
  async handlePedidoCreado(@Payload() evento: PedidoCreadoAsyncEvent) {
    await this.delay(Number(process.env.BENCHMARK_ASYNC_DELAY_MS ?? 120));
    this.logger.log(
      `Evento Redis procesado: pedido=${evento.pedidoId}, producto=${evento.productoId}, cantidad=${evento.cantidad}`,
    );
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
