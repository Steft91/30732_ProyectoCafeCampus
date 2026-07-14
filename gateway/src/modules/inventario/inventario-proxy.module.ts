import { Module } from '@nestjs/common';
import { InventarioProxyController } from './inventario-proxy.controller';
import { InventarioProxyService } from './inventario-proxy.service';

@Module({
  controllers: [InventarioProxyController],
  providers: [InventarioProxyService],
})
export class InventarioProxyModule {}
