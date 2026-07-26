import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthModule } from "./auth/auth.module";
import { BenchmarkModule } from "./modules/benchmark/benchmark.module";
import { InventarioProxyModule } from "./modules/inventario/inventario-proxy.module";
import { PedidosProxyModule } from "./modules/pedidos/pedidos-proxy.module";
import { ProductosProxyModule } from "./modules/productos/productos-proxy.module";

@Module({
    imports: [
        // JWT disponible globalmente para los guards
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET ?? "cafe-campus-secret",
            signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" },
        }),
        PassportModule,
        AuthModule,
        ProductosProxyModule,
        PedidosProxyModule,
        InventarioProxyModule,
        BenchmarkModule,
    ],
})
export class AppModule {}
