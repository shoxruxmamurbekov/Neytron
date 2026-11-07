export interface EnvConfig {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGINS: string[];
  SWAGGER_ENABLED: boolean;
  THROTTLE_TTL_MS: number;
  THROTTLE_LIMIT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TTL_SECONDS: number;
  JWT_REFRESH_TTL_SECONDS: number;
}

const NODE_ENVS = ['development', 'test', 'production'] as const;

function requireString(raw: Record<string, unknown>, key: string): string {
  const value = raw[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value.trim();
}

function parseInteger(raw: Record<string, unknown>, key: string, fallback: number, min: number): number {
  const value = raw[key];
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new Error(`Environment variable ${key} must be an integer >= ${min}`);
  }
  return parsed;
}

function parseBoolean(raw: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = raw[key];
  if (value === undefined || value === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Environment variable ${key} must be "true" or "false"`);
}

function parseSecret(raw: Record<string, unknown>, key: string): string {
  const secret = requireString(raw, key);
  if (secret.length < 32) {
    throw new Error(`Environment variable ${key} must be at least 32 characters long`);
  }
  return secret;
}

/** Ishga tushishda barcha muhit o'zgaruvchilarini tekshiradi; xato bo'lsa jarayon to'xtaydi. */
export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const nodeEnv = (raw.NODE_ENV ?? 'development') as string;
  if (!(NODE_ENVS as readonly string[]).includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of: ${NODE_ENVS.join(', ')}`);
  }

  const corsRaw = typeof raw.CORS_ORIGINS === 'string' ? raw.CORS_ORIGINS : '';
  const corsOrigins = corsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    NODE_ENV: nodeEnv as EnvConfig['NODE_ENV'],
    PORT: parseInteger(raw, 'PORT', 3000, 1),
    DATABASE_URL: requireString(raw, 'DATABASE_URL'),
    CORS_ORIGINS: corsOrigins,
    SWAGGER_ENABLED: parseBoolean(raw, 'SWAGGER_ENABLED', nodeEnv !== 'production'),
    THROTTLE_TTL_MS: parseInteger(raw, 'THROTTLE_TTL_MS', 60_000, 1),
    THROTTLE_LIMIT: parseInteger(raw, 'THROTTLE_LIMIT', 100, 1),
    JWT_ACCESS_SECRET: parseSecret(raw, 'JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: parseSecret(raw, 'JWT_REFRESH_SECRET'),
    JWT_ACCESS_TTL_SECONDS: parseInteger(raw, 'JWT_ACCESS_TTL_SECONDS', 15 * 60, 60),
    JWT_REFRESH_TTL_SECONDS: parseInteger(raw, 'JWT_REFRESH_TTL_SECONDS', 14 * 24 * 60 * 60, 3600),
  };
}
