import { Module } from '@nestjs/common';
import { BenchmarkTcpController } from './benchmark.tcp.controller';

@Module({
  controllers: [BenchmarkTcpController],
})
export class BenchmarkModule {}
