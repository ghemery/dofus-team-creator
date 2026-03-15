export interface ClassStats {
  aoesDamage: number;
  singleTargetDamage: number;
  mpRemoval: number;
  shield: number;
  enemyDamageReduction: number;
  lifeSteal: number;
  healing: number;
  mobility: number;
  rangeDamage: number;
  midRangeDamage: number;
  meleeDamage: number;
  tankiness: number;
}

export interface DofusClass {
  id: string;
  name: string;
  logoUrl: string;
  color: string;
  incompatibleWith: string[];
  stats: ClassStats;
}

export type RoleType = 'tank' | 'soutienPolyvalent' | 'dpt' | 'dpt2';

export interface TeamRoles {
  tank: string | null;
  soutienPolyvalent: string | null;
  dpt: string | null;
  dpt2: string | null;
}

export interface TeamComment {
  description: string;
  strengths: string;
  weaknesses: string;
}

export interface SavedTeam {
  id: string;
  roles: TeamRoles;
  patch: string;
  comment: TeamComment;
  autoScore: number;
  userRatings: number[];
  createdAt: number;
  name?: string;
  isRecommended?: boolean;
}

export type Tier = 'S' | 'A' | 'B' | 'C';

export const CURRENT_PATCH = '3.5';

export const AVAILABLE_PATCHES = ['3.5', '3.4', '3.3', '3.2', '3.1', '3.0'];

export const ROLE_ORDER: RoleType[] = ['tank', 'soutienPolyvalent', 'dpt', 'dpt2'];

export const ROLE_LABELS: Record<RoleType, string> = {
  tank: 'Tank',
  soutienPolyvalent: 'Soutien polyvalent',
  dpt: 'DPT',
  dpt2: 'DPT2 ou hybride DPT/soutien',
};

export const ROLE_LABELS_SHORT: Record<RoleType, string> = {
  tank: 'Tank',
  soutienPolyvalent: 'Soutien',
  dpt: 'DPT',
  dpt2: 'DPT2/Hybride',
};

export const ROLE_COLORS: Record<RoleType, string> = {
  tank: '#48dbfb',
  soutienPolyvalent: '#1dd1a1',
  dpt: '#ff6b6b',
  dpt2: '#ff9f43',
};

export const STAT_LABELS: Record<keyof ClassStats, string> = {
  aoesDamage: 'Dégâts zone',
  singleTargetDamage: 'Dégâts monocible',
  mpRemoval: 'Retrait PM',
  shield: 'Shield',
  enemyDamageReduction: 'Armure',
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

export const EMPTY_COMMENT: TeamComment = {
  description: '',
  strengths: '',
  weaknesses: '',
};
