import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

const MS_PEDIDOS_URL = process.env.MS_PEDIDOS_URL ?? 'http://localhost:3002';

@Injectable()
export class PedidosProxyService {
  async findAll() {
    return this.request('GET', '/pedidos');
  }

  async findByUsuario(usuarioId: string) {
    return this.request('GET', `/pedidos/usuario/${usuarioId}`);
  }

  async findOne(id: string) {
    return this.request('GET', `/pedidos/${id}`);
  }

  async create(data: unknown, usuarioId: string) {
    // El gateway enriquece el body con el usuarioId extraído del JWT
    return this.request('POST', '/pedidos', { ...(data as object), usuarioId });
  }

  async actualizarEstado(id: string, data: unknown) {
    return this.request('PATCH', `/pedidos/${id}/estado`, data);
  }

  async cancelar(id: string, usuarioId: string) {
    return this.request('PATCH', `/pedidos/${id}/cancelar`, { usuarioId });
  }

  private async request(method: string, path: string, data?: unknown) {
    try {
      const response = await axios({ method, url: `${MS_PEDIDOS_URL}${path}`, data });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message = (axiosError.response?.data as any)?.message ?? 'Error en MS Pedidos';
      throw new HttpException(message, status);
    }
  }
}
