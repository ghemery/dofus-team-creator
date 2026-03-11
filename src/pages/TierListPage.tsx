import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { computeFinalScore, getTier } from '../lib/scoring';
import { TierSection } from '../components/TierSection';
import { Tier, SavedTeam, AVAILABLE_PATCHES } from '../types';

const TIERS: Tier[] = ['S', 'A', 'B', 'C'];

export function TierListPage() {
  const { classes, loading } = useClasses();
  const { teams, submitRating, removeTeam, hasRated, initialized } = useTeams();
  const navigate = useNavigate();
  const [selectedPatch, setSelectedPatch] = useState<string>('all');

  const isLoading = loading || !initialized;

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement...</div>;
  }

  const filteredTeams = selectedPatch === 'all'
    ? teams
    : teams.filter(t => (t.patch ?? '3.5') === selectedPatch);

  const teamsByTier: Record<Tier, SavedTeam[]> = { S: [], A: [], B: [], C: [] };

  const sorted = [...filteredTeams].sort((a, b) => {
    const sa = computeFinalScore(a.autoScore, a.userRatings);
    const sb = computeFinalScore(b.autoScore, b.userRatings);
    return sb - sa;
  });

  for (const team of sorted) {
    const finalScore = computeFinalScore(team.autoScore, team.userRatings);
    const tier = getTier(finalScore);
    teamsByTier[tier].push(team);
  }

  const isEmpty = filteredTeams.length === 0;

  // Count per patch for display
  const patchCounts: Record<string, number> = {};
  for (const t of teams) {
    const p = t.patch ?? '3.5';
    patchCounts[p] = (patchCounts[p] ?? 0) + 1;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>🏆 Tier List</h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Classement des équipes par score — votez pour influencer le classement !
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="dofus-btn-outline" onClick={() => navigate('/suggestions')}>💡 Suggestions</button>
          <button className="dofus-btn" onClick={() => navigate('/')}>+ Créer une équipe</button>
        </div>
      </div>

      {/* Patch filter */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.25rem',
        padding: '0.75rem 1rem',
        background: '#1c2128',
        border: '1px solid #30363d',
        borderRadius: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 600, marginRight: '0.25rem' }}>Filtrer par patch :</span>
        {['all', ...AVAILABLE_PATCHES].map(p => {
          const count = p === 'all' ? teams.length : (patchCounts[p] ?? 0);
          const isActive = selectedPatch === p;
          return (
            <button
              key={p}
              onClick={() => setSelectedPatch(p)}
              style={{
                background: isActive ? 'rgba(212,160,23,0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(212,160,23,0.6)' : '#30363d'}`,
                borderRadius: 6,
                color: isActive ? '#d4a017' : '#8b949e',
                padding: '0.3rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {p === 'all' ? `Tous (${count})` : `Patch ${p} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Tier legend */}
      <div style={{
        display: 'flex', gap: '1rem', marginBottom: '1.25rem',
        padding: '0.6rem 1rem', background: '#1c2128', border: '1px solid #30363d',
        borderRadius: 10, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {[
          { label: 'S ≥ 9', color: '#ff4d4d' },
          { label: 'A : 7-8', color: '#ff9900' },
          { label: 'B : 5-6', color: '#4da6ff' },
          { label: 'C < 5', color: '#8b949e' },
        ].map(({ label, color }) => (
          <span key={label} style={{
            background: `${color}22`, border: `1px solid ${color}`, color,
            borderRadius: 4, padding: '1px 8px', fontWeight: 700, fontSize: '0.78rem',
          }}>{label}</span>
        ))}
        <div style={{ marginLeft: 'auto', color: '#8b949e', fontSize: '0.72rem' }}>
          Score = 30% auto + 70% votes
        </div>
      </div>

      {isEmpty ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', background: '#1c2128',
          border: '1px dashed #30363d', borderRadius: 16, color: '#8b949e',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e6edf3', marginBottom: '0.5rem' }}>
            {selectedPatch !== 'all' ? `Aucune équipe pour le patch ${selectedPatch}` : 'Aucune équipe dans le classement'}
          </div>
          <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {selectedPatch !== 'all'
              ? 'Essayez un autre patch ou créez une équipe pour ce patch.'
              : 'Créez votre première équipe ou importez des suggestions !'}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="dofus-btn" onClick={() => navigate('/')}>⚔️ Créer une équipe</button>
            <button className="dofus-btn-outline" onClick={() => navigate('/suggestions')}>💡 Suggestions</button>
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
