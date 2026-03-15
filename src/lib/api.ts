import type { SavedTeam, DofusClass, TeamRoles, TeamComment, ClassStats, AppUser } from '../types';

const BASE = '/api';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(email: string, password: string, username: string): Promise<{ token: string; user: AppUser }> {
  return json(await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  }));
}

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: AppUser }> {
  return json(await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));
}

export async function apiGetMe(token: string): Promise<{ user: AppUser }> {
  return json(await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }));
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function apiGetTeams(): Promise<SavedTeam[]> {
  return json(await fetch(`${BASE}/teams`));
}

export async function apiCreateTeam(
  roles: TeamRoles,
  autoScore: number,
  patch: string,
  comment: TeamComment,
  name?: string,
  createdAt?: number,
): Promise<SavedTeam> {
  return json(await fetch(`${BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles, autoScore, patch, comment, name, createdAt }),
  }));
}

export async function apiDeleteTeam(id: string): Promise<void> {
  await json(await fetch(`${BASE}/teams/${id}`, { method: 'DELETE' }));
}

export async function apiRateTeam(id: string, rating: number): Promise<SavedTeam> {
  return json(await fetch(`${BASE}/teams/${id}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  }));
}

// ─── Classes ──────────────────────────────────────────────────────────────────

export async function apiGetClasses(): Promise<DofusClass[] | null> {
  return json(await fetch(`${BASE}/classes`));
}

export async function apiSaveClasses(classes: DofusClass[], token: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/classes`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(classes),
  }));
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function apiVerifyAdmin(token: string): Promise<boolean> {
  const res: { ok: boolean } = await json(await fetch(`${BASE}/admin/verify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({}),
  }));
  return res.ok;
}

export async function apiChangePassword(token: string, newPassword: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/password`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ newPassword }),
  }));
}

export async function apiCreateRecommendedTeam(
  roles: TeamRoles,
  autoScore: number,
  patch: string,
  comment: TeamComment,
  name: string,
  token: string,
): Promise<SavedTeam> {
  return json(await fetch(`${BASE}/admin/teams`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ roles, autoScore, patch, comment, name }),
  }));
}

export async function apiUpdateRecommendedTeam(
  id: string,
  roles: TeamRoles,
  autoScore: number,
  patch: string,
  comment: TeamComment,
  name: string,
  token: string,
): Promise<SavedTeam> {
  return json(await fetch(`${BASE}/admin/teams/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ roles, autoScore, patch, comment, name }),
  }));
}

export async function apiDeleteRecommendedTeam(id: string, token: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/teams/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  }));
}

// ─── User management ─────────────────────────────────────────────────────────

export async function apiGetUsers(token: string): Promise<AppUser[]> {
  return json(await fetch(`${BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }));
}

export async function apiSetUserRole(id: string, role: 'user' | 'admin', token: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ role }),
  }));
}

export async function apiDeleteUser(id: string, token: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  }));
}

// ─── Class Ratings ─────────────────────────────────────────────────────────────

export async function apiGetClassCommunityStats(patch?: string): Promise<{ averages: Record<string, ClassStats>; counts: Record<string, number> }> {
  const url = patch ? `${BASE}/class-ratings?patch=${encodeURIComponent(patch)}` : `${BASE}/class-ratings`;
  return json(await fetch(url));
}

export async function apiRateClass(classId: string, stats: ClassStats, patch: string): Promise<void> {
  await json(await fetch(`${BASE}/class-ratings/${classId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats, patch }),
  }));
}
