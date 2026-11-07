import { validateEnv } from './env.validation';

const SECRET = 'a'.repeat(32);
const base = {
  DATABASE_URL: 'postgresql://neytron:neytron@localhost:5432/neytron?schema=public',
  JWT_ACCESS_SECRET: SECRET,
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('validateEnv', () => {
  it('applies safe defaults when optional values are absent', () => {
    const env = validateEnv({ ...base });
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.SWAGGER_ENABLED).toBe(true);
    expect(env.JWT_ACCESS_TTL_SECONDS).toBe(900);
    expect(env.CORS_ORIGINS).toEqual([]);
  });

  it('disables Swagger by default in production', () => {
    const env = validateEnv({ ...base, NODE_ENV: 'production' });
    expect(env.SWAGGER_ENABLED).toBe(false);
  });

  it('parses CORS origins as a trimmed list', () => {
    const env = validateEnv({ ...base, CORS_ORIGINS: ' http://a.test , http://b.test ,' });
    expect(env.CORS_ORIGINS).toEqual(['http://a.test', 'http://b.test']);
  });

  it('throws when DATABASE_URL is missing', () => {
    const withoutDatabase: Record<string, unknown> = { ...base };
    delete withoutDatabase.DATABASE_URL;
    expect(() => validateEnv(withoutDatabase)).toThrow('DATABASE_URL is required');
  });

  it('rejects JWT secrets shorter than 32 characters', () => {
    expect(() => validateEnv({ ...base, JWT_ACCESS_SECRET: 'short' })).toThrow(
      'JWT_ACCESS_SECRET must be at least 32 characters long',
    );
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'staging' })).toThrow('NODE_ENV must be one of');
  });

  it('rejects a non-integer PORT', () => {
    expect(() => validateEnv({ ...base, PORT: 'abc' })).toThrow('PORT must be an integer');
  });

  it('rejects a boolean flag that is not true or false', () => {
    expect(() => validateEnv({ ...base, SWAGGER_ENABLED: 'yes' })).toThrow(
      'SWAGGER_ENABLED must be "true" or "false"',
    );
  });
});
