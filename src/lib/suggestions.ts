import { DofusClass, TeamRoles } from '../types';
import { computeAutoScore } from './scoring';

export interface TeamSuggestion {
  roles: TeamRoles;
  autoScore: number;
  label: string;
  description: string;
}

type ClassId = string;

/**
 * Generate team composition suggestions.
 * Tries to cover the 4 main roles: DPS, Healer, Tank, Utility.
 */
export function generateSuggestions(classes: DofusClass[]): TeamSuggestion[] {
  if (classes.length === 0) return [];

  // Categorize classes by their strongest stat categories
  const dpsMelee = topBy(classes, c =>
    Math.max(c.stats.meleeDamage, c.stats.singleTargetDamage * 0.8),
  );
  const dpsRange = topBy(classes, c =>
    Math.max(c.stats.rangeDamage, c.stats.singleTargetDamage),
  );
  const dpsAoe = topBy(classes, c =>
    Math.max(c.stats.aoesDamage, c.stats.midRangeDamage * 0.8),
  );
  const healers = topBy(classes, c =>
    Math.max(c.stats.healing, c.stats.lifeSteal * 0.7),
  );
  const tanks = topBy(classes, c =>
    Math.max(c.stats.tankiness, c.stats.shield * 0.8, c.stats.enemyDamageReduction * 0.7),
  );
  const cc = topBy(classes, c =>
    Math.max(c.stats.mpRemoval, c.stats.mobility * 0.5),
  );

  const templates: Array<{
    label: string;
    description: string;
    pick: (cls: DofusClass[]) => TeamRoles;
  }> = [
    {
      label: 'Équipe Équilibrée',
      description: 'Une composition polyvalente couvrant tous les rôles essentiels.',
      pick: () => ({
        dps1: dpsRange[0],
        dps2: dpsMelee[0] !== dpsRange[0] ? dpsMelee[0] : dpsMelee[1] ?? dpsMelee[0],
        tank: tanks[0],
        support: healers[0],
      }),
    },
    {
      label: 'Double DPS Distance',
      description: 'Deux DPS à distance pour un maximum de dégâts sécurisés.',
      pick: () => ({
        dps1: dpsRange[0],
        dps2: dpsRange[1] ?? dpsRange[0],
        tank: tanks[0],
        support: healers[0],
      }),
    },
    {
      label: 'AoE Devastator',
      description: 'Spécialisée dans les dégâts de zone pour effacer des groupes d\'ennemis.',
      pick: () => ({
        dps1: dpsAoe[0],
        dps2: dpsAoe[1] ?? dpsAoe[0],
        tank: tanks[0],
        support: healers[0],
      }),
    },
    {
      label: 'Burst Monocible',
      description: 'Maximise les dégâts sur une seule cible — idéale contre les boss.',
      pick: () => ({
        dps1: dpsRange[0],
        dps2: dpsMelee[0],
        tank: cc[0],
        support: healers[0],
      }),
    },
    {
      label: 'Forteresse',
      description: 'Composition ultra-résistante avec deux protecteurs.',
      pick: () => ({
        dps1: dpsRange[0],
        dps2: dpsMelee[0],
        tank: tanks[0],
        support: tanks[1] !== tanks[0] ? tanks[1] : healers[0],
      }),
    },
    {
      label: 'Contrôle Total',
      description: 'Maximise le retrait PM et la mobilité pour dominer le terrain.',
      pick: () => ({
        dps1: cc[0],
        dps2: cc[1] ?? cc[0],
        tank: tanks[0],
        support: healers[0],
      }),
    },
    {
      label: 'Soin Abondant',
      description: 'Double soigneur pour une survie maximale.',
      pick: () => ({
        dps1: dpsRange[0],
        dps2: dpsMelee[0],
        tank: tanks[0],
        support: healers[0],
      }),
    },
    {
      label: 'Full Melee',
      description: 'Composition axée sur le corps à corps pour les amateurs d\'action rapprochée.',
      pick: () => ({
        dps1: dpsMelee[0],
        dps2: dpsMelee[1] ?? dpsMelee[0],
        tank: tanks[0],
        support: healers[0],
      }),
    },
  ];

  const suggestions: TeamSuggestion[] = [];
  const seenKeys = new Set<string>();

  for (const tmpl of templates) {
    const roles = tmpl.pick(classes);
    // Ensure all roles are filled
    const allFilled = Object.values(roles).every(Boolean);
    if (!allFilled) continue;

    const key = Object.values(roles).sort().join('-');
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const autoScore = computeAutoScore(roles, classes);
    suggestions.push({
      roles,
      autoScore,
      label: tmpl.label,
      description: tmpl.description,
    });
  }

  return suggestions.sort((a, b) => b.autoScore - a.autoScore);
}

function topBy(classes: DofusClass[], score: (c: DofusClass) => number): ClassId[] {
  return [...classes]
    .sort((a, b) => score(b) - score(a))
    .map(c => c.id);
}
