export interface Config {
  port: number;
  dbPath: string;
  jwtSecret: string;
  tokenTtl: string;
  corsOrigin: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const secret = env.JWT_SECRET;
  if (!secret && env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET muhit o‘zgaruvchisi production uchun majburiy');
  }
  return {
    port: Number(env.PORT ?? 8080),
    dbPath: env.DB_PATH ?? 'data/neytron.db',
    // Faqat dev uchun zaxira kalit; production'da yuqoridagi tekshiruv ishga tushiradi
    jwtSecret: secret ?? 'dev-only-insecure-secret-change-me',
    tokenTtl: env.TOKEN_TTL ?? '7d',
    corsOrigin: env.CORS_ORIGIN ?? 'http://localhost:5173',
  };
}
