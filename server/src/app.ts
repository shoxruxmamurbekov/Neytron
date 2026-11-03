import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import type { Db } from './db.js';
import type { Config } from './config.js';
import { authRouter } from './routes/auth.js';
import { projectsRouter } from './routes/projects.js';

export function createApp(db: Db, config: Config) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'neytron-server' });
  });
  app.use('/api/auth', authRouter(db, config));
  app.use('/api/projects', projectsRouter(db, config));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Topilmadi' });
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'JSON noto‘g‘ri' });
      return;
    }
    if (err.type === 'entity.too.large') {
      res.status(413).json({ error: 'So‘rov juda katta' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Ichki server xatosi' });
  });
  return app;
}
