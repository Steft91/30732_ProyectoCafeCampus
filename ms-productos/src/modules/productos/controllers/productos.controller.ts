import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductosService } from '../services/productos.service';
import { CrearProductoDto, ActualizarProductoDto } from '../dto/producto.dto';

/**
 * El MS Productos no valida JWT — ese trabajo ya lo hizo el Gateway.
 * Solo recibe peticiones internas del gateway (red privada).
 */
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get('disponibles')
  findDisponibles() {
    return this.productosService.findDisponibles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CrearProductoDto) {
    return this.productosService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: ActualizarProductoDto) {
    return this.productosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }

  @Patch(':id/disponibilidad')
  toggleDisponibilidad(@Param('id') id: string) {
    return this.productosService.toggleDisponibilidad(id);
  }
}
