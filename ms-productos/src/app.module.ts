import { Module } from '@nestjs/common';
import { ProductosModule } from './modules/productos/productos.module';

@Module({
  imports: [ProductosModule],
})
export class AppModule {}
