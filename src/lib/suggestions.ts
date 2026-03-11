import { DofusClass, TeamRoles } from '../types';
import { computeAutoScore } from './scoring';

export interface TeamSuggestion {
  roles: TeamRoles;
  autoScore: number;
  label: string;
  description: string;
}

type ClassId = string;

export function generateSuggestions(classes: DofusClass[]): TeamSuggestion[] {
  if (classes.length === 0) return [];

  const dpsMelee = topBy(classes, c => Math.max(c.stats.meleeDamage, c.stats.singleTargetDamage * 0.8));
  const dpsRange = topBy(classes, c => Math.max(c.stats.rangeDamage, c.stats.singleTargetDamage));
  const dpsAoe = topBy(classes, c => Math.max(c.stats.aoesDamage, c.stats.midRangeDamage * 0.8));
  const healers = topBy(classes, c => Math.max(c.stats.healing, c.stats.lifeSteal * 0.7));
  const tanks = topBy(classes, c => Math.max(c.stats.tankiness, c.stats.shield * 0.8, c.stats.enemyDamageReduction * 0.7));
  const cc = topBy(classes, c => Math.max(c.stats.mpRemoval, c.stats.mobility * 0.5));

  const templates: Array<{
    label: string;
    description: string;
    pick: () => TeamRoles;
  }> = [
    {
      label: 'Équipe Équilibrée',
      description: 'Une composition polyvalente couvrant tous les rôles essentiels.',
      pick: () => ({
        tank: tanks[0],
        soutienPolyvalent: healers[0],
        dpt: dpsRange[0],
        dpt2: dpsMelee[0] !== dpsRange[0] ? dpsMelee[0] : dpsMelee[1] ?? dpsMelee[0],
      }),
    },
    {
      label: 'Double DPS Distance',
      description: 'Deux DPT à distance pour un maximum de dégâts sécurisés.',
      pick: () => ({
        tank: tanks[0],
        soutienPolyvalent: healers[0],
        dpt: dpsRange[0],
        dpt2: dpsRange[1] ?? dpsRange[0],
      }),
    },
    {
      label: 'AoE Devastator',
      description: 'Spécialisée dans les dégâts de zone pour effacer des groupes d\'ennemis.',
      pick: () => ({
        tank: tanks[0],
        soutienPolyvalent: healers[0],
        dpt: dpsAoe[0],
        dpt2: dpsAoe[1] ?? dpsAoe[0],
      }),
    },
    {
      label: 'Burst Monocible',
      description: 'Maximise les dégâts sur une seule cible — idéale contre les boss.',
      pick: () => ({
        tank: cc[0],
        soutienPolyvalent: healers[0],
        dpt: dpsRange[0],
        dpt2: dpsMelee[0],
      }),
    },
    {
      label: 'Forteresse',
      description: 'Composition ultra-résistante avec protection maximale.',
      pick: () => ({
        tank: tanks[0],
        soutienPolyvalent: tanks[1] !== tanks[0] ? tanks[1] : healers[0],
        dpt: dpsRange[0],
        dpt2: dpsMelee[0],
      }),
    },
    {
      label: 'Contrôle Total',
      description: 'Maximise le retrait PM et la mobilité pour dominer le terrain.',
      pick: () => ({
        tank: tanks[0],
        soutienPolyvalent: healers[0],
        dpt: cc[0],
        dpt2: cc[1] ?? cc[0],
      }),
    },
    {
      label: 'Full Melee',
      description: 'Composition axée corps à corps pour les amateurs d\'action rapprochée.',
      pick: () => ({
        tank: tanks[0],
        soutienPolyvalent: healers[0],
        dpt: dpsMelee[0],
        dpt2: dpsMelee[1] ?? dpsMelee[0],
      }),
    },
    {
      label: 'Hybride DPT/Soutien',
      description: 'Mix de DPS et d\'utilitaire pour une équipe self-sufficient.',
      pick: () => ({
        tank: tanks[0],
        soutienPolyvalent: healers[0],
        dpt: dpsRange[0],
        dpt2: cc[0] !== dpsRange[0] ? cc[0] : cc[1] ?? dpsAoe[0],
      }),
    },
  ];

  const suggestions: TeamSuggestion[] = [];
  const seenKeys = new Set<string>();

  for (const tmpl of templates) {
    const roles = tmpl.pick();
    const allFilled = Object.values(roles).every(Boolean);
    if (!allFilled) continue;

    const key = Object.values(roles).sort().join('-');
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const autoScore = computeAutoScore(roles, classes);
    suggestions.push({ roles, autoScore, label: tmpl.label, description: tmpl.description });
  }

  return suggestions.sort((a, b) => b.autoScore - a.autoScore);
}

function topBy(classes: DofusClass[], score: (c: DofusClass) => number): ClassId[] {
  return [...classes].sort((a, b) => score(b) - score(a)).map(c => c.id);
}
