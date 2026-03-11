import { DofusClass, ClassStats, TeamRoles, Tier, getTier } from '../types';

export function computeAutoScore(roles: TeamRoles, classes: DofusClass[]): number {
  const classIds = Object.values(roles).filter(Boolean) as string[];
  if (classIds.length < 4) return 0;

  const teamClasses = classIds.map(id => classes.find(c => c.id === id)!).filter(Boolean);
  if (teamClasses.length < 4) return 0;

  const avg = (stat: keyof ClassStats) =>
    teamClasses.reduce((sum, c) => sum + c.stats[stat], 0) / 4;

  const damageScore = Math.max(avg('singleTargetDamage'), avg('aoesDamage'));
  const healScore = Math.max(avg('healing'), avg('lifeSteal') * 0.7);
  const protectionScore = Math.max(avg('tankiness'), avg('shield') * 0.8, avg('enemyDamageReduction') * 0.7);
  const utilityScore = Math.max(avg('mpRemoval'), avg('mobility') * 0.5, avg('enemyDamageReduction') * 0.5);

  const categoryScores = [damageScore, healScore, protectionScore, utilityScore];
  const coverageScore = categoryScores.reduce((sum, s) => {
    const normalized = Math.min(s / 10, 1);
    return sum + normalized;
  }, 0) / 4;

  const primaryStats: (keyof ClassStats)[] = [
    'singleTargetDamage', 'aoesDamage', 'healing', 'tankiness', 'mpRemoval',
    'mobility', 'shield', 'lifeSteal',
  ];

  function getPrimaryStrength(c: DofusClass): keyof ClassStats {
    let best: keyof ClassStats = 'singleTargetDamage';
    let bestVal = 0;
    for (const stat of primaryStats) {
      if (c.stats[stat] > bestVal) {
        bestVal = c.stats[stat];
        best = stat;
      }
    }
    return best;
  }

  const primaries = teamClasses.map(getPrimaryStrength);
  const uniquePrimaries = new Set(primaries).size;
  const diversityScore = uniquePrimaries / 4;

  let incompatibilityPenalty = 0;
  for (let i = 0; i < classIds.length; i++) {
    const cls = teamClasses[i];
    if (!cls) continue;
    for (let j = i + 1; j < classIds.length; j++) {
      if (cls.incompatibleWith.includes(classIds[j])) {
        incompatibilityPenalty += 0.25;
      }
    }
  }
  const incompatScore = Math.max(0, 1 - incompatibilityPenalty);

  const raw = coverageScore * 0.50 + diversityScore * 0.30 + incompatScore * 0.20;
  return Math.round(raw * 10 * 10) / 10;
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
