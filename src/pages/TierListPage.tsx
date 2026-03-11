import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { computeFinalScore, getTier } from '../lib/scoring';
import { TierSection } from '../components/TierSection';
import { Tier, SavedTeam } from '../types';
import { useNavigate } from 'react-router-dom';

const TIERS: Tier[] = ['S', 'A', 'B', 'C'];

export function TierListPage() {
  const { classes, loading } = useClasses();
  const { teams, submitRating, removeTeam, hasRated } = useTeams();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>
        Chargement...
      </div>
    );
  }

  const teamsByTier: Record<Tier, SavedTeam[]> = { S: [], A: [], B: [], C: [] };

  // Sort teams by final score descending
  const sorted = [...teams].sort((a, b) => {
    const sa = computeFinalScore(a.autoScore, a.userRatings);
    const sb = computeFinalScore(b.autoScore, b.userRatings);
    return sb - sa;
  });

  for (const team of sorted) {
    const finalScore = computeFinalScore(team.autoScore, team.userRatings);
    const tier = getTier(finalScore);
    teamsByTier[tier].push(team);
  }

  const isEmpty = teams.length === 0;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
            🏆 Tier List
          </h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Classement des équipes par score — votez pour influencer le classement !
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="dofus-btn-outline" onClick={() => navigate('/suggestions')}>
            💡 Suggestions
          </button>
          <button className="dofus-btn" onClick={() => navigate('/')}>
            + Créer une équipe
          </button>
        </div>
      </div>

      {/* Tier legend */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: 10,
          flexWrap: 'wrap',
        }}
      >
        {[
          { tier: 'S', label: 'S ≥ 9', color: '#ff4d4d' },
          { tier: 'A', label: 'A : 7-8', color: '#ff9900' },
          { tier: 'B', label: 'B : 5-6', color: '#4da6ff' },
          { tier: 'C', label: 'C < 5', color: '#8b949e' },
        ].map(({ tier, label, color }) => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                background: `${color}22`,
                border: `1px solid ${color}`,
                color,
                borderRadius: 4,
                padding: '1px 8px',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {label}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', color: '#8b949e', fontSize: '0.75rem' }}>
          Score = 30% auto + 70% votes communauté
        </div>
      </div>

      {isEmpty ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#1c2128',
            border: '1px dashed #30363d',
            borderRadius: 16,
            color: '#8b949e',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e6edf3', marginBottom: '0.5rem' }}>
            Aucune équipe dans le classement
          </div>
          <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Créez votre première équipe ou importez des suggestions !
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="dofus-btn" onClick={() => navigate('/')}>
              ⚔️ Créer une équipe
            </button>
            <button className="dofus-btn-outline" onClick={() => navigate('/suggestions')}>
              💡 Voir les suggestions
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {TIERS.map(tier => (
            <TierSection
              key={tier}
              tier={tier}
              teams={teamsByTier[tier]}
              classes={classes}
              onRate={submitRating}
              onDelete={removeTeam}
              hasRatedFn={hasRated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
