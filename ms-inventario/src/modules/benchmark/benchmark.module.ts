import { Module } from '@nestjs/common';
import { BenchmarkEventsController } from './benchmark.events.controller';
import { BenchmarkTcpController } from './benchmark.tcp.controller';

@Module({
  controllers: [BenchmarkTcpController, BenchmarkEventsController],
})
export class BenchmarkModule {}
