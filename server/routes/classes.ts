import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/classes — returns override array or null
router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare(`SELECT data FROM classes_override`).all() as { data: string }[];
  if (rows.length === 0) {
    res.json(null);
    return;
  }
  res.json(rows.map(r => JSON.parse(r.data)));
});

// PUT /api/admin/classes — upsert full classes array (admin only)
router.put('/', (req: Request, res: Response) => {
  const pwd =
    req.body?.adminPassword ??
    req.headers['x-admin-password'] ??
    '';
  const stored = (db.prepare(`SELECT value FROM settings WHERE key = 'admin_password'`).get() as { value: string } | undefined)?.value;
  if (pwd !== stored) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { classes } = req.body;
  if (!Array.isArray(classes)) {
    res.status(400).json({ error: 'classes must be an array' });
    return;
  }

  const upsert = db.prepare(`INSERT OR REPLACE INTO classes_override (id, data) VALUES (?, ?)`);
  const upsertAll = db.transaction((list: unknown[]) => {
    // Clear existing overrides first
    db.prepare(`DELETE FROM classes_override`).run();
    for (const cls of list) {
      const c = cls as { id: string };
      upsert.run(c.id, JSON.stringify(cls));
    }
  });

  upsertAll(classes);
  res.json({ ok: true, count: classes.length });
});

export default router;
