import { Module } from '@nestjs/common';
import { PedidosController } from './controllers/pedidos.controller';
import { PedidosService } from './services/pedidos.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, PrismaService],
})
export class PedidosModule {}
