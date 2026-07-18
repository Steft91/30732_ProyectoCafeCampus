import { Module } from '@nestjs/common';
import { InventarioModule } from './modules/inventario/inventario.module';
import { BenchmarkModule } from './modules/benchmark/benchmark.module';
import { EventosModule } from './modules/eventos/eventos.module';

@Module({
  imports: [InventarioModule, BenchmarkModule, EventosModule],
})
export class AppModule {}
