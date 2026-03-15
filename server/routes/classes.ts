import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

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

// PUT /api/classes — upsert full classes array (admin only, legacy endpoint)
router.put('/', requireAdmin, (req: Request, res: Response) => {
  const { classes } = req.body;
  if (!Array.isArray(classes)) {
    res.status(400).json({ error: 'classes must be an array' });
    return;
  }
  const upsert = db.prepare(`INSERT OR REPLACE INTO classes_override (id, data) VALUES (?, ?)`);
  const upsertAll = db.transaction((list: unknown[]) => {
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
