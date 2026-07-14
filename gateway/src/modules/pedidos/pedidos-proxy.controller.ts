import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual, UsuarioPayload } from '../../common/decorators/usuario-actual.decorator';
import { PedidosProxyService } from './pedidos-proxy.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosProxyController {
  constructor(private readonly pedidosProxy: PedidosProxyService) {}

  /** Admin y personal ven todos los pedidos */
  @Get()
  @Roles('admin', 'personal')
  findAll() {
    return this.pedidosProxy.findAll();
  }

  /** Estudiante ve solo sus pedidos */
  @Get('mis-pedidos')
  @Roles('estudiante')
  findMisPedidos(@UsuarioActual() usuario: UsuarioPayload) {
    return this.pedidosProxy.findByUsuario(usuario.sub);
  }

  @Get(':id')
  @Roles('admin', 'personal', 'estudiante')
  findOne(@Param('id') id: string) {
    return this.pedidosProxy.findOne(id);
  }

  /** Estudiante crea el pedido; el gateway inyecta su userId */
  @Post()
  @Roles('estudiante')
  create(@Body() body: unknown, @UsuarioActual() usuario: UsuarioPayload) {
    return this.pedidosProxy.create(body, usuario.sub);
  }

  /** Personal y admin cambian el estado (en preparación, listo, entregado) */
  @Patch(':id/estado')
  @Roles('admin', 'personal')
  actualizarEstado(@Param('id') id: string, @Body() body: unknown) {
    return this.pedidosProxy.actualizarEstado(id, body);
  }

  /** Estudiante cancela su propio pedido pendiente */
  @Patch(':id/cancelar')
  @Roles('estudiante')
  cancelar(@Param('id') id: string, @UsuarioActual() usuario: UsuarioPayload) {
    return this.pedidosProxy.cancelar(id, usuario.sub);
  }
}
