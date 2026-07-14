import { Module } from '@nestjs/common';
import { ProductosProxyController } from './productos-proxy.controller';
import { ProductosProxyService } from './productos-proxy.service';

@Module({
  controllers: [ProductosProxyController],
  providers: [ProductosProxyService],
})
export class ProductosProxyModule {}
