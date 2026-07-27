import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  PedidoCreadoRabbitmqEvent,
  PedidosRabbitmqService,
} from './pedidos-rabbitmq.service';

@Controller()
export class PedidosRabbitmqController {
  constructor(private readonly pedidosRabbitmqService: PedidosRabbitmqService) {}

  @EventPattern('pedido.creado.rabbitmq')
  async handlePedidoCreado(@Payload() evento: PedidoCreadoRabbitmqEvent) {
    await this.pedidosRabbitmqService.procesarPedidoCreado(evento);
  }
}
