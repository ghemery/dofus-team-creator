export interface ClassStats {
  aoesDamage: number;          // Dégâts zone
  singleTargetDamage: number;  // Gros dégâts monocible
  mpRemoval: number;           // Retrait PM
  shield: number;              // Shield
  enemyDamageReduction: number; // Réduction dégâts ennemis
  lifeSteal: number;           // Vol de vie
  healing: number;             // Soin
  mobility: number;            // Mobilité
  rangeDamage: number;         // Dégâts distance
  midRangeDamage: number;      // Dégâts mi-distance
  meleeDamage: number;         // Dégâts CAC
  tankiness: number;           // Gros tank
}

export interface DofusClass {
  id: string;
  name: string;
  logoUrl: string;
  color: string;             // Class accent color
  incompatibleWith: string[]; // Array of class IDs
  stats: ClassStats;
}

export type RoleType = 'dps1' | 'dps2' | 'tank' | 'support';

export interface TeamRoles {
  dps1: string | null;   // class ID or null
  dps2: string | null;
  tank: string | null;
  support: string | null;
}

export interface SavedTeam {
  id: string;
  roles: TeamRoles;
  autoScore: number;
  userRatings: number[];    // stored in localStorage
  createdAt: number;
  name?: string;
}

export type Tier = 'S' | 'A' | 'B' | 'C';

export interface TeamWithTier extends SavedTeam {
  tier: Tier;
  finalScore: number;
  averageUserRating: number | null;
}

export interface AdminPassword {
  hash: string;
}

export const ROLE_LABELS: Record<RoleType, string> = {
  dps1: 'DPS 1',
  dps2: 'DPS 2',
  tank: 'Tank',
  support: 'Support',
};

export const ROLE_COLORS: Record<RoleType, string> = {
  dps1: '#ff6b6b',
  dps2: '#ff9f43',
  tank: '#48dbfb',
  support: '#1dd1a1',
};

export const STAT_LABELS: Record<keyof ClassStats, string> = {
  aoesDamage: 'Dégâts zone',
  singleTargetDamage: 'Dégâts monocible',
  mpRemoval: 'Retrait PM',
  shield: 'Shield',
  enemyDamageReduction: 'Réduction dégâts',
  lifeSteal: 'Vol de vie',
  healing: 'Soins',
  mobility: 'Mobilité',
  rangeDamage: 'Dégâts distance',
  midRangeDamage: 'Dégâts mi-distance',
  meleeDamage: 'Dégâts CAC',
  tankiness: 'Tank',
};

export const STAT_ICONS: Record<keyof ClassStats, string> = {
  aoesDamage: '💥',
  singleTargetDamage: '🎯',
  mpRemoval: '🚫',
  shield: '🛡️',
  enemyDamageReduction: '⬇️',
  lifeSteal: '🩸',
  healing: '💚',
  mobility: '⚡',
  rangeDamage: '🏹',
  midRangeDamage: '⚔️',
  meleeDamage: '🗡️',
  tankiness: '🏋️',
};

export function getTier(score: number): Tier {
  if (score >= 9) return 'S';
  if (score >= 7) return 'A';
  if (score >= 5) return 'B';
  return 'C';
}
