import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import "dotenv/config";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const port = process.env.PORT ?? 3001;
    app.connectMicroservice({
        transport: Transport.GRPC,
        options: {
            package: "productos",
            protoPath: process.env.PROTO_PATH ?? "/proto/productos.proto",
            url: `0.0.0.0:${process.env.GRPC_PORT ?? 50051}`,
        },
    });

    await app.startAllMicroservices();
    await app.listen(port);
    console.log(`MS Productos corriendo en http://localhost:${port}`);
    console.log(`MS Productos gRPC escuchando en puerto ${process.env.GRPC_PORT ?? 50051}`);
}

bootstrap();
