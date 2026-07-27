import { Controller, Logger, UseFilters } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RpcExceptionFilter } from '../../common/filters/rpc-exception.filter';

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
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  PedidoCreadoRabbitmqEvent,
  PedidosRabbitmqService,
} from './pedidos-rabbitmq.service';

@Controller()
@UseFilters(new RpcExceptionFilter('rabbitmq', 'PedidosRabbitmqController.handlePedidoCreado'))
export class PedidosRabbitmqController {
  constructor(private readonly pedidosRabbitmqService: PedidosRabbitmqService) {}

  @EventPattern('pedido.creado.rabbitmq')
  async handlePedidoCreado(@Payload() evento: PedidoCreadoRabbitmqEvent) {
    await this.pedidosRabbitmqService.procesarPedidoCreado(evento);
  }
}
