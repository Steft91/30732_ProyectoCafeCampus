import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPedido } from '@prisma/client';

export class ItemPedidoDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsString()
  @IsNotEmpty()
  nombre: string; // snapshot del nombre al crear el pedido

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  precio: number; // snapshot del precio

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  cantidad: number;
}

export class CrearPedidoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];
}

export class ActualizarEstadoDto {
  @IsEnum(EstadoPedido, { message: 'Estado no válido' })
  estado: EstadoPedido;
}
