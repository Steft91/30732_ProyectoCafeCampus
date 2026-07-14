import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PedidosService } from '../services/pedidos.service';
import { CrearPedidoDto, ActualizarEstadoDto } from '../dto/pedido.dto';

/**
 * Este MS solo recibe peticiones internas desde el gateway.
 * No valida JWT — eso ya lo hizo el gateway.
 */
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  /** El gateway llama a esta ruta pasando el usuarioId extraído del JWT */
  @Get('usuario/:usuarioId')
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.pedidosService.findByUsuario(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  /**
   * El gateway enriquece el body con { ...pedidoDto, usuarioId }
   * antes de reenviar la petición aquí.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CrearPedidoDto & { usuarioId: string }) {
    const { usuarioId, ...dto } = body;
    return this.pedidosService.create(dto, usuarioId);
  }

  @Patch(':id/estado')
  actualizarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoDto) {
    return this.pedidosService.actualizarEstado(id, dto);
  }

  @Patch(':id/cancelar')
  cancelar(
    @Param('id') id: string,
    @Body() body: { usuarioId: string },
  ) {
    return this.pedidosService.cancelar(id, body.usuarioId);
  }
}
