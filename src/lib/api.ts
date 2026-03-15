import type { SavedTeam, DofusClass, TeamRoles, TeamComment, ClassStats } from '../types';

const BASE = '/api';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
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

export async function apiSaveClasses(classes: DofusClass[], adminPassword: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/classes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classes, adminPassword }),
  }));
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function apiVerifyAdmin(password: string): Promise<boolean> {
  const res: { ok: boolean } = await json(await fetch(`${BASE}/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPassword: password }),
  }));
  return res.ok;
}

export async function apiChangePassword(adminPassword: string, newPassword: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPassword, newPassword }),
  }));
}

export async function apiCreateRecommendedTeam(
  roles: TeamRoles,
  autoScore: number,
  patch: string,
  comment: TeamComment,
  name: string,
  adminPassword: string,
): Promise<SavedTeam> {
  return json(await fetch(`${BASE}/admin/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles, autoScore, patch, comment, name, adminPassword }),
  }));
}

export async function apiUpdateRecommendedTeam(
  id: string,
  roles: TeamRoles,
  autoScore: number,
  patch: string,
  comment: TeamComment,
  name: string,
  adminPassword: string,
): Promise<SavedTeam> {
  return json(await fetch(`${BASE}/admin/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles, autoScore, patch, comment, name, adminPassword }),
  }));
}

export async function apiDeleteRecommendedTeam(id: string, adminPassword: string): Promise<void> {
  await json(await fetch(`${BASE}/admin/teams/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify({ adminPassword }),
  }));
}

// ─── Class Ratings ─────────────────────────────────────────────────────────────

export async function apiGetClassCommunityStats(): Promise<{ averages: Record<string, ClassStats>; counts: Record<string, number> }> {
  return json(await fetch(`${BASE}/class-ratings`));
}

export async function apiRateClass(classId: string, stats: ClassStats): Promise<void> {
  await json(await fetch(`${BASE}/class-ratings/${classId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats }),
  }));
}
