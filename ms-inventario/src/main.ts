import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = process.env.PORT ?? 3003;
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.TCP_PORT ?? 4003),
    },
  });
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
  });
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
      queue: process.env.RABBITMQ_PEDIDOS_QUEUE ?? 'cafe_campus_pedidos',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`MS Inventario corriendo en http://localhost:${port}`);
  console.log(`MS Inventario TCP escuchando en puerto ${process.env.TCP_PORT ?? 4003}`);
  console.log(`MS Inventario Redis conectado a ${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`);
  console.log(`MS Inventario RabbitMQ conectado a ${process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'}`);
}

bootstrap();
