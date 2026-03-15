import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

const CURRENT_PATCH = '3.5';

const STAT_KEYS = [
  'aoesDamage', 'singleTargetDamage', 'mpRemoval', 'shield',
  'enemyDamageReduction', 'lifeSteal', 'healing', 'mobility',
  'rangeDamage', 'midRangeDamage', 'meleeDamage', 'tankiness',
];

// GET /api/class-ratings?patch=3.5 — community average stats per class for a patch
router.get('/', (req: Request, res: Response) => {
  const patch = (req.query.patch as string | undefined) ?? CURRENT_PATCH;
  const rows = patch === 'all'
    ? db.prepare(`SELECT class_id, stats FROM class_ratings`).all() as { class_id: string; stats: string }[]
    : db.prepare(`SELECT class_id, stats FROM class_ratings WHERE patch = ?`).all(patch) as { class_id: string; stats: string }[];

  const grouped: Record<string, number[][]> = {};
  for (const row of rows) {
    const stats = JSON.parse(row.stats);
    if (!grouped[row.class_id]) grouped[row.class_id] = STAT_KEYS.map(() => []);
    STAT_KEYS.forEach((key, i) => {
      if (typeof stats[key] === 'number') grouped[row.class_id][i].push(stats[key]);
    });
  }

  const result: Record<string, Record<string, number>> = {};
  for (const [classId, statArrays] of Object.entries(grouped)) {
    const avg: Record<string, number> = {};
    STAT_KEYS.forEach((key, i) => {
      const vals = statArrays[i];
      avg[key] = vals.length > 0
        ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
        : 0;
    });
    result[classId] = avg;
  }

  const counts: Record<string, number> = {};
  for (const [classId, statArrays] of Object.entries(grouped)) {
    counts[classId] = statArrays[0]?.length ?? 0;
  }

  res.json({ averages: result, counts });
});

// POST /api/class-ratings/:classId — submit stats vote
router.post('/:classId', (req: Request, res: Response) => {
  const { classId } = req.params;
  const { stats, patch } = req.body as { stats?: Record<string, number>; patch?: string };

  if (!stats || typeof stats !== 'object') {
    res.status(400).json({ error: 'stats object required' });
    return;
  }

  for (const key of STAT_KEYS) {
    const v = stats[key];
    if (typeof v !== 'number' || v < 0 || v > 10) {
      res.status(400).json({ error: `stats.${key} must be a number 0–10` });
      return;
    }
  }

  const effectivePatch = patch ?? CURRENT_PATCH;
  const id = `${classId}_${effectivePatch}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  db.prepare(`INSERT INTO class_ratings (id, class_id, stats, patch, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, classId, JSON.stringify(stats), effectivePatch, Date.now());

  res.status(201).json({ ok: true });
});

export default router;
