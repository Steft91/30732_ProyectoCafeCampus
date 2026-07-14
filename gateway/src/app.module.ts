import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { ProductosProxyModule } from './modules/productos/productos-proxy.module';
import { PedidosProxyModule } from './modules/pedidos/pedidos-proxy.module';
import { InventarioProxyModule } from './modules/inventario/inventario-proxy.module';
import { BenchmarkModule } from './modules/benchmark/benchmark.module';

@Module({
  imports: [
    // JWT disponible globalmente para los guards
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'cafe-campus-secret',
      signOptions: { expiresIn: '8h' },
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
