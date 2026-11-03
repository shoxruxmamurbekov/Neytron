import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { Db } from '../db.js';
import type { Config } from '../config.js';
import { requireAuth } from '../auth.js';

// Loyiha ichki tuzilmasi (qavatlar, xonalar, jihozlar) frontend'da o‘zgarib turadi,
// shuning uchun server uni to‘liq ob’ekt sifatida saqlaydi. Faqat asosiy maydonlar tekshiriladi.
const projectBody = z.object({
  name: z.string().trim().min(1, 'Loyiha nomi kerak').max(120),
  data: z
    .record(z.string(), z.unknown())
    .refine((d) => JSON.stringify(d).length <= 900_000, 'Ma’lumot juda katta'),
});

interface ProjectRow {
  id: string;
  name: string;
  data: string;
  created_at: string;
  updated_at: string;
}

const toDto = (row: ProjectRow) => ({
  id: row.id,
  name: row.name,
  data: JSON.parse(row.data) as Record<string, unknown>,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function projectsRouter(db: Db, config: Config): Router {
  const r = Router();
  r.use(requireAuth(config.jwtSecret));

  const findOwned = (userId: string, id: string) =>
    db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(id, userId) as unknown as
      | ProjectRow
      | undefined;

  r.get('/', (req, res) => {
    const rows = db
      .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
      .all(req.user!.id) as unknown as ProjectRow[];
    res.json({ projects: rows.map(toDto) });
  });

  r.post('/', (req, res) => {
    const parsed = projectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto‘g‘ri ma’lumot' });
      return;
    }
    const now = new Date().toISOString();
    const id = randomUUID();
    db.prepare(
      'INSERT INTO projects (id, user_id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(id, req.user!.id, parsed.data.name, JSON.stringify(parsed.data.data), now, now);
    res.status(201).json({ project: toDto(findOwned(req.user!.id, id)!) });
  });

  r.get('/:id', (req, res) => {
    const row = findOwned(req.user!.id, req.params.id);
    if (!row) {
      res.status(404).json({ error: 'Loyiha topilmadi' });
      return;
    }
    res.json({ project: toDto(row) });
  });

  r.put('/:id', (req, res) => {
    const parsed = projectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Noto‘g‘ri ma’lumot' });
      return;
    }
    if (!findOwned(req.user!.id, req.params.id)) {
      res.status(404).json({ error: 'Loyiha topilmadi' });
      return;
    }
    db.prepare('UPDATE projects SET name = ?, data = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
      parsed.data.name,
      JSON.stringify(parsed.data.data),
      new Date().toISOString(),
      req.params.id,
      req.user!.id,
    );
    res.json({ project: toDto(findOwned(req.user!.id, req.params.id)!) });
  });

  r.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Loyiha topilmadi' });
      return;
    }
    res.status(204).end();
  });

  return r;
}
