import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

const MS_PRODUCTOS_URL = process.env.MS_PRODUCTOS_URL ?? 'http://localhost:3001';

/**
 * SRP: este servicio solo se encarga de reenviar peticiones al MS Productos.
 * Si el MS cambia de URL o protocolo, solo cambia aquí.
 */
@Injectable()
export class ProductosProxyService {
  async findAll() {
    return this.request('GET', '/productos');
  }

  async findOne(id: string) {
    return this.request('GET', `/productos/${id}`);
  }

  async create(data: unknown) {
    return this.request('POST', '/productos', data);
  }

  async update(id: string, data: unknown) {
    return this.request('PUT', `/productos/${id}`, data);
  }

  async remove(id: string) {
    return this.request('DELETE', `/productos/${id}`);
  }

  private async request(method: string, path: string, data?: unknown) {
    try {
      const response = await axios({ method, url: `${MS_PRODUCTOS_URL}${path}`, data });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message = (axiosError.response?.data as any)?.message ?? 'Error en MS Productos';
      throw new HttpException(message, status);
    }
  }
}
