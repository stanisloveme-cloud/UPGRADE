import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('v1/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Ping to frontend removed (unreliable in Dockerized environment)

      // Checking Prisma connection to the DB
      () => this.prisma.pingCheck('database', this.prismaService),

      // Checking if heap is used more than 200MB 
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),

      // Checking if RSS memory exceeds 500MB
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

      // Checking if more than 90% of disk space is used
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }
}