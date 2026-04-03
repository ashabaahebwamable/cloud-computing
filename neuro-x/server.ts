import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from './server/db.js';
import healthRouter from './server/routes/health.js';
import authRouter from './server/routes/auth.js';
import usersRouter from './server/routes/users.js';
import casesRouter from './server/routes/cases.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';

console.time('NeuroX Startup');

async function startServer() {
  const app = express();

  // ── Core middleware ──────────────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Static uploads directory ─────────────────────────────────────────────────
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  // ── API routes ───────────────────────────────────────────────────────────────
  app.use('/api', healthRouter);
  app.use('/api', authRouter);
  app.use('/api', usersRouter);
  app.use('/api', casesRouter);

  // ── Start listening immediately (Railway health checks) ──────────────────────
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NeuroX] Server listening on port ${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });

  // ── Initialize database ──────────────────────────────────────────────────────
  try {
    console.log('[NeuroX] Initializing database...');
    await getDb();
    console.log('[NeuroX] Database ready.');
  } catch (err) {
    console.error('[NeuroX] Database initialization failed:', err);
  }

  // ── Serve frontend ───────────────────────────────────────────────────────────
  if (IS_PROD) {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      // SPA fallback — must come after API routes
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('[NeuroX] Serving production build from dist/');
    } else {
      console.warn('[NeuroX] dist/ not found — run `npm run build` first');
    }
  } else {
    // In development, Vite runs on port 5173 and proxies /api to this server
    console.log('[NeuroX] Development mode — Vite dev server handles frontend on port 5173');
  }

  console.timeEnd('NeuroX Startup');
}

startServer().catch((err) => {
  console.error('[NeuroX] Fatal startup error:', err);
  process.exit(1);
});
