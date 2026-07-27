import { strict as assert } from 'node:assert';
import { PedidoCreadoRabbitmqEvent, PedidosRabbitmqService } from './pedidos-rabbitmq.service';
import { PrismaService } from '../../prisma/prisma.service';

type RegistroEvento = {
  clave: string;
  tipo: string;
  referenciaId?: string;
  payload?: string;
};

class PrismaEventosFake {
  readonly registros: RegistroEvento[] = [];
  private readonly claves = new Set<string>();

  readonly eventoProcesado = {
    create: async ({ data }: { data: RegistroEvento }) => {
      if (this.claves.has(data.clave)) {
        const error = new Error('Unique constraint failed');
        (error as Error & { code?: string }).code = 'P2002';
        throw error;
      }

      this.claves.add(data.clave);
      this.registros.push(data);
      return { id: `evento-${this.registros.length}`, ...data, creadoEn: new Date() };
    },
  };
}

const crearEvento = (pedidoId: string): PedidoCreadoRabbitmqEvent => ({
  idempotencyKey: `pedido.creado.rabbitmq:${pedidoId}`,
  pedidoId,
  usuarioId: 'Steft91',
  total: 7.5,
  items: [
    {
      productoId: 'producto-demo-examen',
      nombre: 'Cafe examen',
      precio: 7.5,
      cantidad: 1,
    },
  ],
  creadoEn: '2026-07-27T12:30:00.000Z',
});

async function pruebaEventoDuplicadoDejaUnRegistro() {
  const prisma = new PrismaEventosFake();
  const service = new PedidosRabbitmqService(prisma as unknown as PrismaService);
  const evento = crearEvento('pedido-duplicado');

  const primerResultado = await service.procesarPedidoCreado(evento);
  const segundoResultado = await service.procesarPedidoCreado(evento);

  assert.equal(primerResultado.estado, 'procesado');
  assert.equal(segundoResultado.estado, 'duplicado');
  assert.equal(prisma.registros.length, 1);
  assert.equal(prisma.registros[0].clave, 'pedido.creado.rabbitmq:pedido-duplicado');
}

async function pruebaEventosDistintosDejanDosRegistros() {
  const prisma = new PrismaEventosFake();
  const service = new PedidosRabbitmqService(prisma as unknown as PrismaService);

  await service.procesarPedidoCreado(crearEvento('pedido-uno'));
  await service.procesarPedidoCreado(crearEvento('pedido-dos'));

  assert.equal(prisma.registros.length, 2);
  assert.deepEqual(
    prisma.registros.map((registro) => registro.clave),
    ['pedido.creado.rabbitmq:pedido-uno', 'pedido.creado.rabbitmq:pedido-dos'],
  );
}

async function pruebaPayloadInvalidoSeDescarta() {
  const prisma = new PrismaEventosFake();
  const service = new PedidosRabbitmqService(prisma as unknown as PrismaService);

  const resultado = await service.procesarPedidoCreado({ pedidoId: '', items: [] });

  assert.equal(resultado.estado, 'descartado');
  assert.equal(prisma.registros.length, 0);
}

async function main() {
  await pruebaEventoDuplicadoDejaUnRegistro();
  await pruebaEventosDistintosDejanDosRegistros();
  await pruebaPayloadInvalidoSeDescarta();

  console.log('OK - idempotencia RabbitMQ validada');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
