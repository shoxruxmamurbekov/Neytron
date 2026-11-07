import { EnvConfig } from './env.validation';

/** Typed access to validated config values via ConfigService.get<EnvConfig>('app'). */
export const appConfig = (env: EnvConfig) => ({
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  corsOrigins: env.CORS_ORIGINS,
  swaggerEnabled: env.SWAGGER_ENABLED,
});
