import { Module } from '@nestjs/common';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { BenchmarkModule } from './modules/benchmark/benchmark.module';

@Module({
  imports: [PedidosModule, BenchmarkModule],
})
export class AppModule {}
