import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'dofus-dev-secret-change-in-prod';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
