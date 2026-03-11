import { DofusClass, SavedTeam, TeamRoles } from '../types';

const BASE_URL = import.meta.env.BASE_URL;

// ─── Classes (loaded from public JSON) ──────────────────────────────────────

let cachedClasses: DofusClass[] | null = null;

export async function loadClasses(): Promise<DofusClass[]> {
  if (cachedClasses) return cachedClasses;
  const resp = await fetch(`${BASE_URL}data/classes.json`);
  const data = await resp.json();
  cachedClasses = data as DofusClass[];
  return cachedClasses;
}

export function saveClassesToStorage(classes: DofusClass[]): void {
  // In production (GitHub Pages), admin downloads the JSON and commits it.
  // This saves locally for the current session.
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

// ─── Teams (localStorage) ───────────────────────────────────────────────────

const TEAMS_KEY = 'dofus_teams';

export function loadTeams(): SavedTeam[] {
  const raw = localStorage.getItem(TEAMS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function persistTeams(teams: SavedTeam[]): void {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

export function saveTeam(roles: TeamRoles, autoScore: number, name?: string): SavedTeam {
  const teams = loadTeams();
  const team: SavedTeam = {
    id: Date.now().toString(),
    roles,
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
  // Each user can only rate once per team (tracked by localStorage)
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

// ─── Admin password ─────────────────────────────────────────────────────────

const ADMIN_KEY = 'dofus_admin_pwd';
const DEFAULT_ADMIN_PASSWORD = 'admin1234';

export function checkAdminPassword(pwd: string): boolean {
  const stored = localStorage.getItem(ADMIN_KEY) ?? DEFAULT_ADMIN_PASSWORD;
  return pwd === stored;
}

export function setAdminPassword(newPwd: string): void {
  localStorage.setItem(ADMIN_KEY, newPwd);
}
