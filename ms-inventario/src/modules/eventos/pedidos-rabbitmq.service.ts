import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type PedidoCreadoRabbitmqEvent = {
  idempotencyKey?: string;
  pedidoId: string;
  usuarioId: string;
  total: number;
  items: Array<{
    productoId: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }>;
  creadoEn: string;
};

export type ResultadoPedidoRabbitmq =
  | { estado: 'procesado'; idempotencyKey: string }
  | { estado: 'duplicado'; idempotencyKey: string }
  | { estado: 'descartado'; motivo: string };

type ValidacionEvento =
  | { ok: true; evento: PedidoCreadoRabbitmqEvent; idempotencyKey: string }
  | { ok: false; motivo: string };

@Injectable()
export class PedidosRabbitmqService {
  private readonly logger = new Logger(PedidosRabbitmqService.name);
  private readonly tipoEvento = 'pedido.creado.rabbitmq';

  constructor(private readonly prisma: PrismaService) {}

  async procesarPedidoCreado(evento: unknown): Promise<ResultadoPedidoRabbitmq> {
    try {
      const validacion = this.validarEvento(evento);

      if (!validacion.ok) {
        this.logger.warn(`Evento RabbitMQ descartado por payload invalido: ${validacion.motivo}`);
        return { estado: 'descartado', motivo: validacion.motivo };
      }

      const { evento: payload, idempotencyKey } = validacion;

      try {
        await this.prisma.eventoProcesado.create({
          data: {
            clave: idempotencyKey,
            tipo: this.tipoEvento,
            referenciaId: payload.pedidoId,
            payload: JSON.stringify(payload),
          },
        });
      } catch (error) {
        if (this.esErrorClaveDuplicada(error)) {
          this.logger.warn(`Evento RabbitMQ duplicado descartado: idempotencyKey=${idempotencyKey}`);
          return { estado: 'duplicado', idempotencyKey };
        }

        throw error;
      }

      this.logger.log(
        `Evento RabbitMQ procesado: pedido=${payload.pedidoId}, usuario=${payload.usuarioId}, total=${payload.total}, items=${payload.items.length}, idempotencyKey=${idempotencyKey}`,
      );

      return { estado: 'procesado', idempotencyKey };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error controlado al procesar evento RabbitMQ: ${message}`, stack);

      return { estado: 'descartado', motivo: message };
    }
  }

  private validarEvento(evento: unknown): ValidacionEvento {
    if (!evento || typeof evento !== 'object') {
      return { ok: false, motivo: 'El evento no es un objeto' };
    }

    const candidato = evento as Partial<PedidoCreadoRabbitmqEvent>;

    if (!this.esTextoValido(candidato.pedidoId)) {
      return { ok: false, motivo: 'pedidoId es obligatorio' };
    }

    if (!this.esTextoValido(candidato.usuarioId)) {
      return { ok: false, motivo: 'usuarioId es obligatorio' };
    }

    if (typeof candidato.total !== 'number' || Number.isNaN(candidato.total)) {
      return { ok: false, motivo: 'total debe ser numerico' };
    }

    if (!Array.isArray(candidato.items) || candidato.items.length === 0) {
      return { ok: false, motivo: 'items debe tener al menos un producto' };
    }

    if (!this.esTextoValido(candidato.creadoEn)) {
      return { ok: false, motivo: 'creadoEn es obligatorio' };
    }

    const idempotencyKey = this.esTextoValido(candidato.idempotencyKey)
      ? candidato.idempotencyKey
      : `${this.tipoEvento}:${candidato.pedidoId}`;

    return {
      ok: true,
      evento: candidato as PedidoCreadoRabbitmqEvent,
      idempotencyKey,
    };
  }

  private esTextoValido(valor: unknown): valor is string {
    return typeof valor === 'string' && valor.trim().length > 0;
  }

  private esErrorClaveDuplicada(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }
}
