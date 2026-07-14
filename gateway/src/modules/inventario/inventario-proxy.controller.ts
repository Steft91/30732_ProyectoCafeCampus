import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InventarioProxyService } from './inventario-proxy.service';

@Controller('inventario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventarioProxyController {
  constructor(private readonly inventarioProxy: InventarioProxyService) {}

  /** Admin y personal pueden ver el stock */
  @Get()
  @Roles('admin', 'personal')
  findAll() {
    return this.inventarioProxy.findAll();
  }

  @Get(':productoId')
  @Roles('admin', 'personal')
  findByProducto(@Param('productoId') productoId: string) {
    return this.inventarioProxy.findByProducto(productoId);
  }

  /** Solo admin puede registrar entradas de stock */
  @Post('entrada')
  @Roles('admin')
  registrarEntrada(@Body() body: unknown) {
    return this.inventarioProxy.registrarEntrada(body);
  }

  /** Solo admin puede hacer ajustes manuales */
  @Post('ajuste')
  @Roles('admin')
  registrarAjuste(@Body() body: unknown) {
    return this.inventarioProxy.registrarAjuste(body);
  }

  /** Historial de movimientos por producto */
  @Get(':productoId/movimientos')
  @Roles('admin', 'personal')
  findMovimientos(@Param('productoId') productoId: string) {
    return this.inventarioProxy.findMovimientos(productoId);
  }

  /** Productos bajo el mínimo de stock */
  @Get('alertas/bajo-stock')
  @Roles('admin', 'personal')
  findBajoStock() {
    return this.inventarioProxy.findBajoStock();
  }
}
