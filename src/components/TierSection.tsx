import { SavedTeam, DofusClass, Tier } from '../types';
import { TeamCard } from './TeamCard';

interface TierSectionProps {
  tier: Tier;
  teams: SavedTeam[];
  classes: DofusClass[];
  onRate: (teamId: string, rating: number) => void;
  onDelete: (teamId: string) => void;
  hasRatedFn: (teamId: string) => boolean;
}

const tierConfig: Record<Tier, { label: string; color: string; bg: string; description: string }> = {
  S: { label: 'S', color: '#ff4d4d', bg: 'rgba(255,77,77,0.06)', description: 'Compositions légendaires — score ≥ 9' },
  A: { label: 'A', color: '#ff9900', bg: 'rgba(255,153,0,0.06)', description: 'Très bonnes compositions — score 7-8' },
  B: { label: 'B', color: '#4da6ff', bg: 'rgba(77,166,255,0.06)', description: 'Compositions correctes — score 5-6' },
  C: { label: 'C', color: '#8b949e', bg: 'rgba(139,148,158,0.06)', description: 'Compositions à améliorer — score < 5' },
};

export function TierSection({ tier, teams, classes, onRate, onDelete, hasRatedFn }: TierSectionProps) {
  const cfg = tierConfig[tier];
  if (teams.length === 0) return null;

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{
        background: `${cfg.color}11`,
        borderBottom: `1px solid ${cfg.color}33`,
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: `${cfg.color}22`, border: `2px solid ${cfg.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color, fontWeight: 900, fontSize: '1.5rem',
        }}>
          {cfg.label}
        </div>
        <div>
          <div style={{ color: cfg.color, fontWeight: 700, fontSize: '1rem' }}>Tier {cfg.label}</div>
          <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>
            {cfg.description} — {teams.length} composition{teams.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '0.75rem',
        padding: '1rem',
      }}>
        {teams.map(team => (
          <TeamCard
            key={team.id}
            team={team}
            classes={classes}
            onRate={r => onRate(team.id, r)}
            onDelete={() => onDelete(team.id)}
            hasRated={hasRatedFn(team.id)}
          />
        ))}
      </div>
    </div>
  );
}
