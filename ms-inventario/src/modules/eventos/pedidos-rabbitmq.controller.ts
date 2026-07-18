import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

type PedidoCreadoRabbitmqEvent = {
  pedidoId: string;
  usuarioId: string;
  total: number;
  items: Array<{
    productoId: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }>;
  creadoEn: string;
};

@Controller()
export class PedidosRabbitmqController {
  private readonly logger = new Logger(PedidosRabbitmqController.name);

  @EventPattern('pedido.creado.rabbitmq')
  handlePedidoCreado(@Payload() evento: PedidoCreadoRabbitmqEvent) {
    this.logger.log(
      `Evento RabbitMQ recibido: pedido=${evento.pedidoId}, usuario=${evento.usuarioId}, total=${evento.total}, items=${evento.items.length}`,
    );
  }
}
