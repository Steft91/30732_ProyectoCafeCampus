import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PedidosRabbitmqController } from './pedidos-rabbitmq.controller';
import { PedidosRabbitmqService } from './pedidos-rabbitmq.service';

@Module({
  controllers: [PedidosRabbitmqController],
  providers: [PedidosRabbitmqService, PrismaService],
})
export class EventosModule {}
