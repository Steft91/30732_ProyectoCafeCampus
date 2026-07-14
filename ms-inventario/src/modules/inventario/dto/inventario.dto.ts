import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EntradaStockDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  cantidad: number;

  @IsString()
  @IsOptional()
  motivo?: string;
}

export class AjusteStockDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsInt()
  @Type(() => Number)
  // Puede ser positivo (entrada) o negativo (salida/corrección)
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  motivo: string; // obligatorio en ajustes manuales para auditoría
}

export class InicializarStockDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  cantidad: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minimo?: number;
}

/** DTO para validación de stock antes de confirmar un pedido */
export class ItemValidarDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  cantidad: number;
}

export class ValidarStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemValidarDto)
  items: ItemValidarDto[];
}

/** DTO para descuento automático al confirmar un pedido */
export class DescontarStockDto {
  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemValidarDto)
  items: ItemValidarDto[];
}
