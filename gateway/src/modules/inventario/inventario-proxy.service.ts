import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

const MS_INVENTARIO_URL = process.env.MS_INVENTARIO_URL ?? 'http://localhost:3003';

@Injectable()
export class InventarioProxyService {
  async findAll() {
    return this.request('GET', '/inventario');
  }

  async findByProducto(productoId: string) {
    return this.request('GET', `/inventario/${productoId}`);
  }

  async registrarEntrada(data: unknown) {
    return this.request('POST', '/inventario/entrada', data);
  }

  async registrarAjuste(data: unknown) {
    return this.request('POST', '/inventario/ajuste', data);
  }

  async findMovimientos(productoId: string) {
    return this.request('GET', `/inventario/${productoId}/movimientos`);
  }

  async findBajoStock() {
    return this.request('GET', '/inventario/alertas/bajo-stock');
  }

  private async request(method: string, path: string, data?: unknown) {
    try {
      const response = await axios({ method, url: `${MS_INVENTARIO_URL}${path}`, data });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message = (axiosError.response?.data as any)?.message ?? 'Error en MS Inventario';
      throw new HttpException(message, status);
    }
  }
}
