import { Module } from '@nestjs/common';
import { InventarioController } from './controllers/inventario.controller';
import { InventarioService } from './services/inventario.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [InventarioController],
  providers: [InventarioService, PrismaService],
})
export class InventarioModule {}
