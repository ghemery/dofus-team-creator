import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from '../db.js';
import { signToken, verifyToken } from '../lib/jwt.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, username } = req.body as { email?: string; password?: string; username?: string };
  if (!email || !password || !username) {
    res.status(400).json({ error: 'Email, mot de passe et pseudo sont requis' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    return;
  }
  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
  if (existing) {
    res.status(409).json({ error: 'Cet email est déjà utilisé' });
    return;
  }
  const hash = bcrypt.hashSync(password, 10);
  const id = randomUUID();
  db.prepare(`INSERT INTO users (id, email, username, password, role, created_at) VALUES (?, ?, ?, ?, 'user', ?)`)
    .run(id, email.trim().toLowerCase(), username.trim(), hash, Date.now());
  const user = { id, email: email.trim().toLowerCase(), username: username.trim(), role: 'user' };
  const token = signToken({ ...user });
  res.json({ token, user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis' });
    return;
  }
  const row = db.prepare(`SELECT id, email, username, password, role FROM users WHERE email = ?`)
    .get(email.trim().toLowerCase()) as { id: string; email: string; username: string; password: string; role: string } | undefined;
  if (!row || !bcrypt.compareSync(password, row.password)) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    return;
  }
  const user = { id: row.id, email: row.email, username: row.username, role: row.role };
  const token = signToken(user);
  res.json({ token, user });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }
  try {
    const payload = verifyToken(authHeader.slice(7));
    const row = db.prepare(`SELECT id, email, username, role FROM users WHERE id = ?`).get(payload.id) as {
      id: string; email: string; username: string; role: string;
    } | undefined;
    if (!row) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
    res.json({ user: row });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

export default router;
