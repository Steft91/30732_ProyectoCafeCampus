import { Module } from '@nestjs/common';
import { ProductosController } from './controllers/productos.controller';
import { ProductosService } from './services/productos.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, PrismaService],
})
export class ProductosModule {}
