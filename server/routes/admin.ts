import { Router, Request, Response } from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { verifyToken } from '../lib/jwt.js';

const router = Router();

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
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7));
      if (payload.role === 'admin') { res.json({ ok: true }); return; }
    } catch { /* fall through */ }
  }
  const pwd = (req.body?.adminPassword as string | undefined) ?? (req.headers['x-admin-password'] as string | undefined) ?? '';
  const stored = (db.prepare(`SELECT value FROM settings WHERE key = 'admin_password'`).get() as { value: string } | undefined)?.value;
  res.json({ ok: pwd === stored });
});

// PUT /api/admin/password
router.put('/password', requireAdmin, (req: Request, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'newPassword is required' });
    return;
  }
  db.prepare(`UPDATE settings SET value = ? WHERE key = 'admin_password'`).run(newPassword);
  res.json({ ok: true });
});

// POST /api/admin/teams — create recommended team
router.post('/teams', requireAdmin, (req: Request, res: Response) => {
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
router.put('/teams/:id', requireAdmin, (req: Request, res: Response) => {
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
router.delete('/teams/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare(`SELECT id FROM teams WHERE id = ? AND is_recommended = 1`).get(id);
  if (!existing) {
    res.status(404).json({ error: 'Recommended team not found' });
    return;
  }
  db.prepare(`DELETE FROM teams WHERE id = ?`).run(id);
  res.json({ ok: true });
});

// ─── User management ──────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', requireAdmin, (_req: Request, res: Response) => {
  const users = db.prepare(`SELECT id, email, username, role, created_at FROM users ORDER BY created_at ASC`).all();
  res.json(users);
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body as { role?: string };
  if (role !== 'user' && role !== 'admin') {
    res.status(400).json({ error: 'Rôle invalide (user ou admin)' });
    return;
  }
  const target = db.prepare(`SELECT id, role FROM users WHERE id = ?`).get(id) as { id: string; role: string } | undefined;
  if (!target) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
  // Prevent demoting the last admin
  if (target.role === 'admin' && role === 'user') {
    const adminCount = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'admin'`).get() as { c: number }).c;
    if (adminCount <= 1) { res.status(400).json({ error: 'Impossible de rétrograder le dernier administrateur' }); return; }
  }
  db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, id);
  res.json({ ok: true });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const target = db.prepare(`SELECT id, role FROM users WHERE id = ?`).get(id) as { id: string; role: string } | undefined;
  if (!target) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
  // Prevent deleting the last admin
  if (target.role === 'admin') {
    const adminCount = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'admin'`).get() as { c: number }).c;
    if (adminCount <= 1) { res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' }); return; }
  }
  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  res.json({ ok: true });
});

// PUT /api/admin/classes — save class overrides
router.put('/classes', requireAdmin, (req: Request, res: Response) => {
  const classes = req.body as Array<{ id: string }>;
  if (!Array.isArray(classes)) {
    res.status(400).json({ error: 'Expected array of classes' });
    return;
  }
  const upsert = db.prepare(`INSERT OR REPLACE INTO classes_override (id, data) VALUES (?, ?)`);
  const upsertAll = db.transaction((list: typeof classes) => {
    for (const cls of list) upsert.run(cls.id, JSON.stringify(cls));
  });
  upsertAll(classes);
  res.json({ ok: true });
});

export default router;
