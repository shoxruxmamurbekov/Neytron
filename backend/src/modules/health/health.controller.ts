import { Controller, Get, HttpStatus, Res, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ok } from '../../common/dto/api-response';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ description: 'Servis va ma’lumotlar bazasi holati' })
  @ApiServiceUnavailableResponse({ description: 'Ma’lumotlar bazasi javob bermayapti' })
  async check(@Res({ passthrough: true }) res: Response) {
    const started = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        message: 'Ma’lumotlar bazasi mavjud emas',
      });
    }
    res.status(HttpStatus.OK);
    return ok({
      status: 'ok',
      database: 'up',
      uptimeSeconds: Math.round(process.uptime()),
      dbLatencyMs: Date.now() - started,
    });
  }
}
