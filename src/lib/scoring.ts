import { DofusClass, ClassStats, TeamRoles, Tier, getTier } from '../types';

// ─── Auto-score calculation ──────────────────────────────────────────────────

/**
 * Ideal team has:
 * - Good damage (DPS)
 * - Good healing or sustain
 * - Good tankiness or protection
 * - Utility (CC, MP removal, mobility)
 *
 * Score: 0-10
 */
export function computeAutoScore(roles: TeamRoles, classes: DofusClass[]): number {
  const classIds = Object.values(roles).filter(Boolean) as string[];
  if (classIds.length < 4) return 0;

  const teamClasses = classIds.map(id => classes.find(c => c.id === id)!).filter(Boolean);
  if (teamClasses.length < 4) return 0;

  // --- 1. Balance score (50%) ------------------------------------------------
  // Average of each stat across team, then score how well each "category" is covered

  const avg = (stat: keyof ClassStats) =>
    teamClasses.reduce((sum, c) => sum + c.stats[stat], 0) / 4;

  // Key role categories
  const damageScore = Math.max(avg('singleTargetDamage'), avg('aoesDamage'));
  const healScore = Math.max(avg('healing'), avg('lifeSteal'));
  const protectionScore = Math.max(avg('tankiness'), avg('shield'), avg('enemyDamageReduction'));
  const utilityScore = Math.max(avg('mpRemoval'), avg('mobility'), avg('enemyDamageReduction'));

  // Penalize if any category is critically low (< 3 average)
  const categoryScores = [damageScore, healScore, protectionScore, utilityScore];
  const coverageScore = categoryScores.reduce((sum, s) => {
    const normalized = Math.min(s / 10, 1);
    return sum + normalized;
  }, 0) / 4;

  // --- 2. Diversity score (30%) -----------------------------------------------
  // Reward teams where classes have different primary strengths
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
  // Reward uniqueness: 4 unique = 1.0, 3 = 0.75, 2 = 0.5, 1 = 0.25
  const diversityScore = uniquePrimaries / 4;

  // --- 3. Incompatibility penalty (20%) ----------------------------------------
  let incompatibilityPenalty = 0;
  for (let i = 0; i < classIds.length; i++) {
    const cls = teamClasses[i];
    if (!cls) continue;
    for (let j = i + 1; j < classIds.length; j++) {
      if (cls.incompatibleWith.includes(classIds[j])) {
        incompatibilityPenalty += 0.25; // Each incompatible pair costs 0.25 (0-1 range)
      }
    }
  }
  const incompatScore = Math.max(0, 1 - incompatibilityPenalty);

  // --- Final weighted score ---------------------------------------------------
  const raw =
    coverageScore * 0.50 +
    diversityScore * 0.30 +
    incompatScore * 0.20;

  return Math.round(raw * 10 * 10) / 10; // 0-10, one decimal
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
