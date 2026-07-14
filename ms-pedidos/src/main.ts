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

  const port = process.env.PORT ?? 3002;
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.TCP_PORT ?? 4002),
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`MS Pedidos corriendo en http://localhost:${port}`);
  console.log(`MS Pedidos TCP escuchando en puerto ${process.env.TCP_PORT ?? 4002}`);
}

bootstrap();
