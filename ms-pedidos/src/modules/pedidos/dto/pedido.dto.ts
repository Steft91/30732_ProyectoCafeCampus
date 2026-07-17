import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsOptional()
  nombre?: string; // compatibilidad: el backend usa el snapshot obtenido por gRPC

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  precio?: number; // compatibilidad: el backend usa el snapshot obtenido por gRPC

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
