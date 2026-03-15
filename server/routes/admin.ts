import { Router, Request, Response } from 'express';
import db from '../db.js';

const router = Router();

// ─── Helper: check admin password ────────────────────────────────────────────

function requireAdmin(req: Request): boolean {
  const pwd =
    req.body?.adminPassword ??
    req.headers['x-admin-password'] ??
    '';
  const stored = (db.prepare(`SELECT value FROM settings WHERE key = 'admin_password'`).get() as { value: string } | undefined)?.value;
  return pwd === stored;
}

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
    isRecommended: true,
    createdAt: row.created_at,
  };
}

// POST /api/admin/verify
router.post('/verify', (req: Request, res: Response) => {
  res.json({ ok: requireAdmin(req) });
});

// PUT /api/admin/password
router.put('/password', (req: Request, res: Response) => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'newPassword is required' });
    return;
  }
  db.prepare(`UPDATE settings SET value = ? WHERE key = 'admin_password'`).run(newPassword);
  res.json({ ok: true });
});

// POST /api/admin/teams — create recommended team
router.post('/teams', (req: Request, res: Response) => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { roles, autoScore, patch, comment, name } = req.body;
  if (!roles || autoScore === undefined || !patch) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const id = `recommended_${Date.now()}`;
  const ts = Date.now();

  db.prepare(`
    INSERT INTO teams (id, name, patch, role_tank, role_soutien, role_dpt, role_dpt2, auto_score, user_ratings, comment_desc, comment_str, comment_weak, is_recommended, created_at)
    VALUES (@id, @name, @patch, @role_tank, @role_soutien, @role_dpt, @role_dpt2, @auto_score, '[]', @comment_desc, @comment_str, @comment_weak, 1, @created_at)
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

// PUT /api/admin/teams/:id — edit recommended team
router.put('/teams/:id', (req: Request, res: Response) => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { id } = req.params;
  const existing = db.prepare(`SELECT * FROM teams WHERE id = ? AND is_recommended = 1`).get(id);
  if (!existing) {
    res.status(404).json({ error: 'Recommended team not found' });
    return;
  }
  const { roles, autoScore, patch, comment, name } = req.body;

  db.prepare(`
    UPDATE teams SET
      name = @name,
      patch = @patch,
      role_tank = @role_tank,
      role_soutien = @role_soutien,
      role_dpt = @role_dpt,
      role_dpt2 = @role_dpt2,
      auto_score = @auto_score,
      comment_desc = @comment_desc,
      comment_str = @comment_str,
      comment_weak = @comment_weak
    WHERE id = @id
  `).run({
    id,
    name: name ?? null,
    patch,
    role_tank: roles?.tank ?? null,
    role_soutien: roles?.soutienPolyvalent,
    role_dpt: roles?.dpt,
    role_dpt2: roles?.dpt2,
    auto_score: autoScore,
    comment_desc: comment?.description ?? '',
    comment_str: comment?.strengths ?? '',
    comment_weak: comment?.weaknesses ?? '',
  });

  const row = db.prepare(`SELECT * FROM teams WHERE id = ?`).get(id) as Record<string, unknown>;
  res.json(rowToTeam(row));
});

// DELETE /api/admin/teams/:id
router.delete('/teams/:id', (req: Request, res: Response) => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { id } = req.params;
  const existing = db.prepare(`SELECT id FROM teams WHERE id = ? AND is_recommended = 1`).get(id);
  if (!existing) {
    res.status(404).json({ error: 'Recommended team not found' });
    return;
  }
  db.prepare(`DELETE FROM teams WHERE id = ?`).run(id);
  res.json({ ok: true });
});

export default router;
