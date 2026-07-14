import { Module } from '@nestjs/common';
import { PedidosProxyController } from './pedidos-proxy.controller';
import { PedidosProxyService } from './pedidos-proxy.service';

@Module({
  controllers: [PedidosProxyController],
  providers: [PedidosProxyService],
})
export class PedidosProxyModule {}
