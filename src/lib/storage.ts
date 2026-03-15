import { DofusClass, ClassStats, SavedTeam, TeamRoles, TeamComment, CURRENT_PATCH, EMPTY_COMMENT } from '../types';
import {
  apiGetTeams,
  apiCreateTeam,
  apiDeleteTeam,
  apiRateTeam,
  apiGetClasses,
  apiSaveClasses,
  apiVerifyAdmin,
  apiChangePassword,
  apiGetClassCommunityStats,
  apiRateClass,
} from './api';

const BASE_URL = import.meta.env.BASE_URL;

// ─── Classes ─────────────────────────────────────────────────────────────────

let cachedClasses: DofusClass[] | null = null;

export async function loadClasses(): Promise<DofusClass[]> {
  if (cachedClasses) return cachedClasses;

  // Check API override first
  try {
    const override = await apiGetClasses();
    if (override && override.length > 0) {
      cachedClasses = override;
      return cachedClasses;
    }
  } catch {
    // Server not available, fall through to static file
  }

  const resp = await fetch(`${BASE_URL}data/classes.json`);
  const data = await resp.json();
  cachedClasses = data as DofusClass[];
  return cachedClasses;
}

export async function saveClassesToStorage(classes: DofusClass[], adminPassword: string): Promise<void> {
  cachedClasses = classes;
  await apiSaveClasses(classes, adminPassword);
}

export async function getClassesOverride(): Promise<DofusClass[] | null> {
  try {
    return await apiGetClasses();
  } catch {
    return null;
  }
}

export function exportClassesJson(classes: DofusClass[]): void {
  const blob = new Blob([JSON.stringify(classes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'classes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function loadTeams(): Promise<SavedTeam[]> {
  return apiGetTeams();
}

export async function saveTeam(
  roles: TeamRoles,
  autoScore: number,
  patch: string = CURRENT_PATCH,
  comment: TeamComment = EMPTY_COMMENT,
  name?: string,
): Promise<SavedTeam> {
  return apiCreateTeam(roles, autoScore, patch, comment, name);
}

export async function rateTeam(teamId: string, rating: number): Promise<void> {
  const ratedKey = `rated_${teamId}`;
  if (localStorage.getItem(ratedKey)) return;
  await apiRateTeam(teamId, rating);
  localStorage.setItem(ratedKey, '1');
}

export function hasRated(teamId: string): boolean {
  return !!localStorage.getItem(`rated_${teamId}`);
}

export async function deleteTeam(teamId: string): Promise<void> {
  await apiDeleteTeam(teamId);
}

// ─── Admin password ───────────────────────────────────────────────────────────

export async function checkAdminPassword(pwd: string): Promise<boolean> {
  return apiVerifyAdmin(pwd);
}

export async function setAdminPassword(currentPwd: string, newPwd: string): Promise<void> {
  await apiChangePassword(currentPwd, newPwd);
}

// ─── Class Ratings ─────────────────────────────────────────────────────────────

export async function loadClassCommunityStats(): Promise<{ averages: Record<string, ClassStats>; counts: Record<string, number> }> {
  try {
    return await apiGetClassCommunityStats();
  } catch {
    return { averages: {}, counts: {} };
  }
}

export async function rateClass(classId: string, stats: ClassStats): Promise<void> {
  await apiRateClass(classId, stats);
  localStorage.setItem(`rated_class_${classId}`, '1');
}

export function hasRatedClass(classId: string): boolean {
  return !!localStorage.getItem(`rated_class_${classId}`);
}

// ─── Migration: localStorage → SQLite ────────────────────────────────────────

export async function migrateLocalStorageTeams(): Promise<void> {
  if (localStorage.getItem('dofus_migrated_to_api')) return;
  const raw = localStorage.getItem('dofus_teams');
  if (!raw) {
    localStorage.setItem('dofus_migrated_to_api', '1');
    return;
  }
  try {
    const teams: SavedTeam[] = JSON.parse(raw);
    const userTeams = teams.filter(t => !t.id.startsWith('default_'));
    for (const t of userTeams) {
      await apiCreateTeam(t.roles, t.autoScore, t.patch, t.comment, t.name, t.createdAt);
    }
    localStorage.setItem('dofus_migrated_to_api', '1');
    console.log(`[migration] Migrated ${userTeams.length} teams to SQLite`);
  } catch (err) {
    console.warn('[migration] Failed to migrate teams:', err);
  }
}
