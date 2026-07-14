import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsPositive,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearProductoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  precio: number;

  @IsString()
  @IsNotEmpty()
  categoriaId: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}

export class ActualizarProductoDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  precio?: number;

  @IsString()
  @IsOptional()
  categoriaId?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;
}
