import { DofusClass, ClassStats, TeamRoles, RoleType, Tier, getTier, ROLE_ORDER } from '../types';

// --- Qualitative helpers ---

export type DamageVolume = 'Élevé' | 'Modéré' | 'Faible';
export type DamageLevel = 'Excellent' | 'Bon' | 'Passable' | 'Pas ouf';

export function getDamageVolume(value: number): DamageVolume {
  if (value >= 7) return 'Élevé';
  if (value >= 4) return 'Modéré';
  return 'Faible';
}

export function getDamageLevel(value: number): DamageLevel {
  if (value >= 8) return 'Excellent';
  if (value >= 6) return 'Bon';
  if (value >= 4) return 'Passable';
  return 'Pas ouf';
}

const volumeColors: Record<DamageVolume, string> = {
  'Élevé': '#d4a017',
  'Modéré': '#4da6ff',
  'Faible': '#8b949e',
};

const levelColors: Record<DamageLevel, string> = {
  'Excellent': '#d4a017',
  'Bon': '#4da6ff',
  'Passable': '#8b949e',
  'Pas ouf': '#444c56',
};

export function getDamageVolumeStyle(value: number): { label: string; color: string } {
  const vol = getDamageVolume(value);
  return { label: vol, color: volumeColors[vol] };
}

export function getDamageLevelStyle(value: number): { label: string; color: string } {
  const lvl = getDamageLevel(value);
  return { label: lvl, color: levelColors[lvl] };
}

// --- Role scoring ---

export function computeDpsScore(cls: DofusClass): number {
  return Math.max(cls.stats.aoesDamage, cls.stats.singleTargetDamage);
}

export function computeSupportScore(cls: DofusClass): number {
  const s = cls.stats;
  return Math.max(s.mobility, s.shield, s.enemyDamageReduction, s.mpRemoval, s.healing);
}

export function computeRoleScore(cls: DofusClass, role: RoleType): number {
  switch (role) {
    case 'tank':
      return cls.stats.tankiness;
    case 'soutienPolyvalent':
      return computeSupportScore(cls);
    case 'dpt':
      return computeDpsScore(cls);
    case 'dpt2':
      return Math.max(computeDpsScore(cls), computeSupportScore(cls));
  }
}

// --- Team scoring ---

export interface RangeProfile {
  range: number;
  midRange: number;
  melee: number;
}

export interface TeamScoreDetails {
  overall: number;
  byRole: Record<RoleType, number>;
  rangeProfile: RangeProfile;
}

export function computeTeamDetails(roles: TeamRoles, classes: DofusClass[]): TeamScoreDetails | null {
  const entries = ROLE_ORDER.map(r => ({ role: r, cls: classes.find(c => c.id === roles[r]) }));
  if (entries.some(e => !e.cls)) return null;

  const byRole = {} as Record<RoleType, number>;
  for (const { role, cls } of entries) {
    byRole[role] = Math.round(computeRoleScore(cls!, role) * 10) / 10;
  }

  const allClasses = entries.map(e => e.cls!);
  const avg = (stat: keyof ClassStats) =>
    allClasses.reduce((sum, c) => sum + c.stats[stat], 0) / allClasses.length;

  const overall =
    Math.round((Object.values(byRole).reduce((a, b) => a + b, 0) / ROLE_ORDER.length) * 10) / 10;

  const rangeProfile: RangeProfile = {
    range: Math.round(avg('rangeDamage') * 10) / 10,
    midRange: Math.round(avg('midRangeDamage') * 10) / 10,
    melee: Math.round(avg('meleeDamage') * 10) / 10,
  };

  // Bonus Cra : booste la portée de toute l'équipe si tous les alliés ont rangeDamage >= 5
  // (classes sans PO modifiable sur leurs sorts ne bénéficient pas du boost → annule le bonus)
  const hasCra = allClasses.some(c => c.id === 'cra');
  const allCanUseRange = allClasses.every(c => c.stats.rangeDamage >= 5);
  if (hasCra && allCanUseRange) {
    rangeProfile.range = Math.min(10, Math.max(rangeProfile.range, 7));
  }

  return { overall, byRole, rangeProfile };
}

export function computeAutoScore(roles: TeamRoles, classes: DofusClass[]): number {
  return computeTeamDetails(roles, classes)?.overall ?? 0;
}

export function computeFinalScore(autoScore: number, userRatings: number[]): number {
  if (userRatings.length === 0) return autoScore;
  const avg = userRatings.reduce((s, r) => s + r, 0) / userRatings.length;
  return Math.round((autoScore * 0.3 + avg * 0.7) * 10) / 10;
}

export function getAverageRating(ratings: number[]): number | null {
  if (ratings.length === 0) return null;
  return Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10;
}

export { getTier };
export type { Tier };
