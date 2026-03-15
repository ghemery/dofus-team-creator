import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// ─── Helper: map DB row → SavedTeam ──────────────────────────────────────────

function rowToTeam(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name ?? undefined,
    patch: row.patch,
    roles: {
      tank: row.role_tank ?? null,
      soutienPolyvalent: row.role_soutien,
      dpt: row.role_dpt,
      dpt2: row.role_dpt2,
    },
    autoScore: row.auto_score,
    userRatings: JSON.parse(row.user_ratings as string),
    comment: {
      description: row.comment_desc,
      strengths: row.comment_str,
      weaknesses: row.comment_weak,
    },
    isRecommended: row.is_recommended === 1,
    createdAt: row.created_at,
  };
}

// GET /api/teams
router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare(`SELECT * FROM teams ORDER BY created_at ASC`).all() as Record<string, unknown>[];
  res.json(rows.map(rowToTeam));
});

// POST /api/teams — create user team
router.post('/', (req: Request, res: Response) => {
  const { roles, autoScore, patch, comment, name, createdAt } = req.body;
  if (!roles || autoScore === undefined || !patch) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const id = Date.now().toString();
  const ts = createdAt ?? Date.now();

  db.prepare(`
    INSERT INTO teams (id, name, patch, role_tank, role_soutien, role_dpt, role_dpt2, auto_score, user_ratings, comment_desc, comment_str, comment_weak, is_recommended, created_at)
    VALUES (@id, @name, @patch, @role_tank, @role_soutien, @role_dpt, @role_dpt2, @auto_score, '[]', @comment_desc, @comment_str, @comment_weak, 0, @created_at)
  `).run({
    id,
    name: name ?? null,
    patch,
    role_tank: roles.tank ?? null,
    role_soutien: roles.soutienPolyvalent,
    role_dpt: roles.dpt,
    role_dpt2: roles.dpt2,
    auto_score: autoScore,
    comment_desc: comment?.description ?? '',
    comment_str: comment?.strengths ?? '',
    comment_weak: comment?.weaknesses ?? '',
    created_at: ts,
  });

  const row = db.prepare(`SELECT * FROM teams WHERE id = ?`).get(id) as Record<string, unknown>;
  res.status(201).json(rowToTeam(row));
});

// DELETE /api/teams/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const row = db.prepare(`SELECT is_recommended FROM teams WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }
  if (row.is_recommended === 1) {
    res.status(403).json({ error: 'Use admin endpoint to delete recommended teams' });
    return;
  }
  db.prepare(`DELETE FROM teams WHERE id = ?`).run(id);
  res.json({ ok: true });
});

// POST /api/teams/:id/rate
router.post('/:id/rate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating } = req.body;
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'rating must be a number between 1 and 5' });
    return;
  }
  const row = db.prepare(`SELECT user_ratings FROM teams WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }
  const ratings: number[] = JSON.parse(row.user_ratings as string);
  ratings.push(rating);
  db.prepare(`UPDATE teams SET user_ratings = ? WHERE id = ?`).run(JSON.stringify(ratings), id);

  const updated = db.prepare(`SELECT * FROM teams WHERE id = ?`).get(id) as Record<string, unknown>;
  res.json(rowToTeam(updated));
});

export default router;
