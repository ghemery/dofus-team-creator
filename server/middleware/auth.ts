import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import db from '../db.js';

// Accepts either a valid JWT with role=admin OR the legacy admin password
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7));
      if (payload.role === 'admin') {
        (req as Request & { user?: unknown }).user = payload;
        return next();
      }
    } catch { /* invalid token, fall through */ }
  }
  // Fall back to legacy password in body or header
  const pwd = (req.body?.adminPassword as string | undefined) ?? (req.headers['x-admin-password'] as string | undefined) ?? '';
  const stored = (db.prepare(`SELECT value FROM settings WHERE key='admin_password'`).get() as { value: string } | undefined)?.value;
  if (pwd && pwd === stored) return next();
  res.status(401).json({ error: 'Non autorisé' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }
  try {
    (req as Request & { user?: unknown }).user = verifyToken(authHeader.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}
