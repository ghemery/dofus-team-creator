import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_ORDER, ROLE_LABELS_SHORT, getTier, CURRENT_PATCH, EMPTY_COMMENT } from '../types';
import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { generateSuggestions, TeamSuggestion } from '../lib/suggestions';
import { ClassLogo } from '../components/ClassLogo';
import { ScoreBar } from '../components/ScoreBar';

const tierColors: Record<string, string> = {
  S: '#ff4d4d', A: '#ff9900', B: '#4da6ff', C: '#8b949e',
};

export function SuggestionsPage() {
  const { classes, loading } = useClasses();
  const { addTeam } = useTeams();
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const suggestions = loading ? [] : generateSuggestions(classes);

  const handleSave = (s: TeamSuggestion) => {
    const key = Object.values(s.roles).join('-');
    addTeam(s.roles, s.autoScore, CURRENT_PATCH, EMPTY_COMMENT, s.label);
    setSavedIds(prev => new Set([...prev, key]));
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>💡 Suggestions de compositions</h1>
        <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          Compositions générées automatiquement selon les statistiques des classes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {suggestions.map(s => {
          const key = Object.values(s.roles).join('-');
          const alreadySaved = savedIds.has(key);
          const tier = getTier(s.autoScore);
          const tierColor = tierColors[tier];

          return (
            <div key={key} className="dofus-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>{s.label}</div>
                  <div style={{ color: '#8b949e', fontSize: '0.75rem', marginTop: 2 }}>{s.description}</div>
                </div>
                <span style={{
                  background: `${tierColor}22`, border: `1px solid ${tierColor}`, color: tierColor,
                  borderRadius: 6, padding: '2px 10px', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                }}>{tier}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {ROLE_ORDER.map(role => {
                  const cls = classes.find(c => c.id === s.roles[role]);
                  return (
                    <div key={role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                      {cls && <ClassLogo dofusClass={cls} size={52} selected />}
                      <span style={{ fontSize: '0.6rem', color: '#8b949e', textAlign: 'center' }}>{ROLE_LABELS_SHORT[role]}</span>
                    </div>
                  );
                })}
              </div>

              <ScoreBar score={s.autoScore} label="Score" size="sm" />

              <button
                onClick={() => handleSave(s)}
                disabled={alreadySaved}
                style={{
                  background: alreadySaved ? 'rgba(29,209,161,0.1)' : 'linear-gradient(135deg, #b8860b, #d4a017)',
                  border: alreadySaved ? '1px solid rgba(29,209,161,0.3)' : 'none',
                  color: alreadySaved ? '#1dd1a1' : '#0d1117',
                  borderRadius: 8, padding: '0.6rem', fontWeight: 700,
                  cursor: alreadySaved ? 'default' : 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
                }}
              >
                {alreadySaved ? '✓ Sauvegardée dans le classement' : '💾 Ajouter au classement'}
              </button>
            </div>
          );
        })}
      </div>

      {suggestions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8b949e', background: '#1c2128', border: '1px solid #30363d', borderRadius: 12 }}>
          Aucune suggestion disponible.
        </div>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button className="dofus-btn-outline" onClick={() => navigate('/tierlist')}>🏆 Voir le classement</button>
      </div>
    </div>
  );
}
