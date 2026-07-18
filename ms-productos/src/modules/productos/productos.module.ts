import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ProductosGrpcController } from "./controllers/productos-grpc.controller";
import { ProductosController } from "./controllers/productos.controller";
import { ProductosService } from "./services/productos.service";

@Module({
    controllers: [ProductosController, ProductosGrpcController],
    providers: [ProductosService, PrismaService],
})
export class ProductosModule {}
