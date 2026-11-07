import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { appConfig } from './config/configuration';
import { EnvConfig, validateEnv } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (raw) => validateEnv(raw as Record<string, unknown>),
      load: [
        () => {
          const env = validateEnv(process.env as Record<string, unknown>);
          return { app: appConfig(env), env };
        },
      ],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigModule],
      useFactory: () => {
        const env = validateEnv(process.env as Record<string, unknown>) as EnvConfig;
        return [{ ttl: env.THROTTLE_TTL_MS, limit: env.THROTTLE_LIMIT }];
      },
    }),
    PrismaModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
