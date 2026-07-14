import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductosProxyService } from './productos-proxy.service';

/**
 * Este controlador actúa como proxy: recibe la petición del frontend,
 * valida JWT + rol, y la reenvía al MS Productos (puerto 3001).
 * OCP: para agregar nuevas rutas solo se extiende este controlador.
 */
@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductosProxyController {
  constructor(private readonly productosProxy: ProductosProxyService) {}

  /** Todos los roles pueden consultar productos */
  @Get()
  @Roles('admin', 'personal', 'estudiante')
  findAll() {
    return this.productosProxy.findAll();
  }

  @Get(':id')
  @Roles('admin', 'personal', 'estudiante')
  findOne(@Param('id') id: string) {
    return this.productosProxy.findOne(id);
  }

  /** Solo administrador puede crear, editar o eliminar */
  @Post()
  @Roles('admin')
  create(@Body() body: unknown) {
    return this.productosProxy.create(body);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.productosProxy.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.productosProxy.remove(id);
  }
}
