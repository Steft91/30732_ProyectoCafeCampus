import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ProductosService } from '../services/productos.service';

type ObtenerProductoRequest = {
  id: string;
};

@Controller()
export class ProductosGrpcController {
  constructor(private readonly productosService: ProductosService) {}

  @GrpcMethod('ProductosGrpcService', 'ObtenerProducto')
  async obtenerProducto(data: ObtenerProductoRequest) {
    try {
      const producto = await this.productosService.findOne(data.id);

      return {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        precio: Number(producto.precio),
        categoriaId: producto.categoriaId,
        categoriaNombre: producto.categoria.nombre,
        disponible: producto.disponible,
      };
    } catch {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Producto con id ${data.id} no encontrado`,
      });
    }
  }
}
