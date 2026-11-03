import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export function signToken(user: AuthUser, secret: string, ttl: string): string {
  return jwt.sign({ sub: user.id, email: user.email }, secret, {
    expiresIn: ttl as jwt.SignOptions['expiresIn'],
    jwtid: randomUUID(),
  });
}

export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
      return;
    }
    try {
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      if (!payload.sub) throw new Error('no sub');
      req.user = { id: String(payload.sub), email: String(payload.email ?? ''), name: '' };
      next();
    } catch {
      res.status(401).json({ error: 'Token yaroqsiz yoki muddati tugagan' });
    }
  };
}
