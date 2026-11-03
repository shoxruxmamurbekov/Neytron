import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { Db } from '../db.js';
import type { Config } from '../config.js';
import { hashPassword, requireAuth, signToken, verifyPassword } from '../auth.js';

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(100),
  password: z.string().min(8, 'Parol kamida 8 belgi').max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
}

export function authRouter(db: Db, config: Config): Router {
  const r = Router();
  const auth = requireAuth(config.jwtSecret);

  r.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto‘g‘ri ma’lumot' });
      return;
    }
    const { email, name, password } = parsed.data;
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) {
      res.status(409).json({ error: 'Bu email allaqachon ro‘yxatdan o‘tgan' });
      return;
    }
    const id = randomUUID();
    db.prepare('INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(
      id,
      email,
      name,
      await hashPassword(password),
      new Date().toISOString(),
    );
    const user = { id, email, name };
    res.status(201).json({ user, token: signToken(user, config.jwtSecret, config.tokenTtl) });
  });

  r.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Email yoki parol noto‘g‘ri' });
      return;
    }
    const row = db
      .prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?')
      .get(parsed.data.email) as unknown as UserRow | undefined;
    // Email mavjudligini oshkor qilmaslik uchun bir xil xabar
    const ok = row ? await verifyPassword(parsed.data.password, row.password_hash) : false;
    if (!row || !ok) {
      res.status(401).json({ error: 'Email yoki parol noto‘g‘ri' });
      return;
    }
    const user = { id: row.id, email: row.email, name: row.name };
    res.json({ user, token: signToken(user, config.jwtSecret, config.tokenTtl) });
  });

  r.get('/me', auth, (req, res) => {
    const row = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user!.id) as unknown as
      | { id: string; email: string; name: string }
      | undefined;
    if (!row) {
      res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
      return;
    }
    res.json({ user: row });
  });

  return r;
}
