import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { computeFinalScore } from '../lib/scoring';
import { SavedTeam, ROLE_ORDER, Tier, getTier } from '../types';
import { ClassLogo } from '../components/ClassLogo';
import { TeamModal } from '../components/TeamModal';

const TIERS: Tier[] = ['S', 'A', 'B', 'C'];

const tierConfig: Record<Tier, { color: string; desc: string }> = {
  S: { color: '#ff4d4d', desc: 'Légendaire — ≥ 9' },
  A: { color: '#ff9900', desc: 'Très bonne — 7-8' },
  B: { color: '#4da6ff', desc: 'Correcte — 5-6' },
  C: { color: '#8b949e', desc: 'À améliorer — < 5' },
};

export function TierListPage() {
  const { classes, loading } = useClasses();
  const { teams, submitRating, hasRated, initialized } = useTeams();
  const navigate = useNavigate();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  if (loading || !initialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement...</div>;
  }

  const defaultTeams = teams.filter(t => t.id.startsWith('default_'));

  const teamsByTier: Record<Tier, SavedTeam[]> = { S: [], A: [], B: [], C: [] };
  const sorted = [...defaultTeams].sort((a, b) =>
    computeFinalScore(b.autoScore, b.userRatings) - computeFinalScore(a.autoScore, a.userRatings)
  );
  for (const team of sorted) {
    const tier = getTier(computeFinalScore(team.autoScore, team.userRatings));
    teamsByTier[tier].push(team);
  }

  const selectedTeam = selectedTeamId ? teams.find(t => t.id === selectedTeamId) ?? null : null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>🏆 Tier List</h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
            Compositions de référence — cliquez sur une équipe pour les détails
          </p>
        </div>
        <button className="dofus-btn" onClick={() => navigate('/')}>+ Créer une équipe</button>
      </div>

      {/* Tier rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {TIERS.map(tier => {
          const t = teamsByTier[tier];
          if (!t.length) return null;
          const cfg = tierConfig[tier];

          return (
            <div key={tier} style={{
              display: 'flex',
              alignItems: 'stretch',
              background: '#1c2128',
              border: `1px solid ${cfg.color}33`,
              borderRadius: 12,
              overflow: 'hidden',
              minHeight: 90,
            }}>
              {/* Tier label */}
              <div style={{
                width: 68,
                flexShrink: 0,
                background: `${cfg.color}14`,
                borderRight: `1px solid ${cfg.color}33`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '0.5rem',
              }}>
                <span style={{ color: cfg.color, fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>{tier}</span>
                <span style={{ color: `${cfg.color}88`, fontSize: '0.58rem', textAlign: 'center', lineHeight: 1.3 }}>{cfg.desc}</span>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.6rem', padding: '0.75rem', alignItems: 'center' }}>
                {t.map(team => (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className="tier-card"
                    style={{
                      background: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: 10,
                      padding: '0.6rem 0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      minWidth: 155,
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = cfg.color + '88';
                      e.currentTarget.style.background = cfg.color + '08';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#30363d';
                      e.currentTarget.style.background = '#161b22';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {ROLE_ORDER.map(role => {
                        const cls = classes.find(c => c.id === team.roles[role]);
                        return cls ? (
                          <ClassLogo key={role} dofusClass={cls} size={36} />
                        ) : (
                          <div key={role} style={{ width: 36, height: 36, borderRadius: '50%', background: '#1c2128', border: '1px dashed #30363d' }} />
                        );
                      })}
                    </div>
                    <span style={{ color: '#e6edf3', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
                      {team.name ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {defaultTeams.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8b949e', background: '#1c2128', border: '1px dashed #30363d', borderRadius: 12 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏗️</div>
          <div style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.5rem' }}>Aucune composition de référence</div>
        </div>
      )}

      {/* Modal */}
      {selectedTeam && (
        <TeamModal
          team={selectedTeam}
          classes={classes}
          onClose={() => setSelectedTeamId(null)}
          onRate={r => submitRating(selectedTeam.id, r)}
          hasRated={hasRated(selectedTeam.id)}
        />
      )}
    </div>
  );
}
