import { Module } from '@nestjs/common';
import { PedidosRabbitmqController } from './pedidos-rabbitmq.controller';

@Module({
  controllers: [PedidosRabbitmqController],
})
export class EventosModule {}
