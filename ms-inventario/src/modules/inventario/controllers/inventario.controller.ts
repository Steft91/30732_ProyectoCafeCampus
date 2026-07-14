import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventarioService } from '../services/inventario.service';
import {
  EntradaStockDto,
  AjusteStockDto,
  InicializarStockDto,
  ValidarStockDto,
  DescontarStockDto,
} from '../dto/inventario.dto';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get()
  findAll() {
    return this.inventarioService.findAll();
  }

  /** Productos con stock por debajo del mínimo */
  @Get('alertas/bajo-stock')
  findBajoStock() {
    return this.inventarioService.findBajoStock();
  }

  @Get(':productoId')
  findByProducto(@Param('productoId') productoId: string) {
    return this.inventarioService.findByProducto(productoId);
  }

  @Get(':productoId/movimientos')
  findMovimientos(@Param('productoId') productoId: string) {
    return this.inventarioService.findMovimientos(productoId);
  }

  /** Llamado desde MS Productos al crear un nuevo producto */
  @Post('inicializar')
  @HttpCode(HttpStatus.CREATED)
  inicializar(@Body() dto: InicializarStockDto) {
    return this.inventarioService.inicializar(dto);
  }

  @Post('entrada')
  @HttpCode(HttpStatus.CREATED)
  registrarEntrada(@Body() dto: EntradaStockDto) {
    return this.inventarioService.registrarEntrada(dto);
  }

  @Post('ajuste')
  @HttpCode(HttpStatus.CREATED)
  registrarAjuste(@Body() dto: AjusteStockDto) {
    return this.inventarioService.registrarAjuste(dto);
  }

  /**
   * Ruta interna — llamada por MS Pedidos para validar stock
   * antes de confirmar un pedido. No pasa por el gateway.
   */
  @Post('validar')
  @HttpCode(HttpStatus.OK)
  validarStock(@Body() dto: ValidarStockDto) {
    return this.inventarioService.validarStock(dto);
  }

  /**
   * Ruta interna — llamada por MS Pedidos para descontar stock
   * después de confirmar un pedido.
   */
  @Post('descontar')
  @HttpCode(HttpStatus.OK)
  descontarStock(@Body() dto: DescontarStockDto) {
    return this.inventarioService.descontarStock(dto);
  }
}
