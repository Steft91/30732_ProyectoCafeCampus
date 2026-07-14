import { Controller, Get } from '@nestjs/common';
import { BenchmarkService } from './benchmark.service';

@Controller('benchmark')
export class BenchmarkController {
  constructor(private readonly benchmarkService: BenchmarkService) {}

  @Get('sync')
  sync() {
    return this.benchmarkService.sync();
  }

  @Get('async')
  async() {
    return this.benchmarkService.async();
  }
}
