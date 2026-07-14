import { Module } from '@nestjs/common';
import { InventarioModule } from './modules/inventario/inventario.module';
import { BenchmarkModule } from './modules/benchmark/benchmark.module';

@Module({
  imports: [InventarioModule, BenchmarkModule],
})
export class AppModule {}
