import { DofusClass, SavedTeam, TeamRoles, TeamComment, CURRENT_PATCH, EMPTY_COMMENT } from '../types';

const BASE_URL = import.meta.env.BASE_URL;

// ─── Classes ─────────────────────────────────────────────────────────────────

let cachedClasses: DofusClass[] | null = null;

export async function loadClasses(): Promise<DofusClass[]> {
  if (cachedClasses) return cachedClasses;
  const resp = await fetch(`${BASE_URL}data/classes.json`);
  const data = await resp.json();
  cachedClasses = data as DofusClass[];
  return cachedClasses;
}

export function saveClassesToStorage(classes: DofusClass[]): void {
  cachedClasses = classes;
  localStorage.setItem('dofus_classes_override', JSON.stringify(classes));
}

export function getClassesOverride(): DofusClass[] | null {
  const raw = localStorage.getItem('dofus_classes_override');
  return raw ? JSON.parse(raw) : null;
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

// ─── Default teams ────────────────────────────────────────────────────────────

async function loadDefaultTeams(): Promise<SavedTeam[]> {
  try {
    const resp = await fetch(`${BASE_URL}data/defaultTeams.json`);
    if (!resp.ok) return [];
    return await resp.json() as SavedTeam[];
  } catch {
    return [];
  }
}

// ─── Teams (localStorage) ─────────────────────────────────────────────────────

const TEAMS_KEY = 'dofus_teams';
const DEFAULTS_LOADED_KEY = 'dofus_defaults_loaded';

export function loadTeams(): SavedTeam[] {
  const raw = localStorage.getItem(TEAMS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function persistTeams(teams: SavedTeam[]): void {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

export async function initDefaultTeams(): Promise<void> {
  if (localStorage.getItem(DEFAULTS_LOADED_KEY)) return;
  const defaults = await loadDefaultTeams();
  if (defaults.length === 0) return;
  const existing = loadTeams();
  if (existing.length === 0) {
    persistTeams(defaults);
  }
  localStorage.setItem(DEFAULTS_LOADED_KEY, '1');
}

export function saveTeam(
  roles: TeamRoles,
  autoScore: number,
  patch: string = CURRENT_PATCH,
  comment: TeamComment = EMPTY_COMMENT,
  name?: string,
): SavedTeam {
  const teams = loadTeams();
  const team: SavedTeam = {
    id: Date.now().toString(),
    roles,
    patch,
    comment,
    autoScore,
    userRatings: [],
    createdAt: Date.now(),
    name,
  };
  teams.push(team);
  persistTeams(teams);
  return team;
}

export function rateTeam(teamId: string, rating: number): void {
  const teams = loadTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return;
  const ratedKey = `rated_${teamId}`;
  if (localStorage.getItem(ratedKey)) return;
  team.userRatings.push(rating);
  localStorage.setItem(ratedKey, '1');
  persistTeams(teams);
}

export function hasRated(teamId: string): boolean {
  return !!localStorage.getItem(`rated_${teamId}`);
}

export function deleteTeam(teamId: string): void {
  const teams = loadTeams().filter(t => t.id !== teamId);
  persistTeams(teams);
}

// ─── Admin password ───────────────────────────────────────────────────────────

const ADMIN_KEY = 'dofus_admin_pwd';
const DEFAULT_ADMIN_PASSWORD = 'admin1234';

export function checkAdminPassword(pwd: string): boolean {
  const stored = localStorage.getItem(ADMIN_KEY) ?? DEFAULT_ADMIN_PASSWORD;
  return pwd === stored;
}

export function setAdminPassword(newPwd: string): void {
  localStorage.setItem(ADMIN_KEY, newPwd);
}
