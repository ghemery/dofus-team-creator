import { useState } from 'react';
import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { computeFinalScore, getAverageRating, getTier } from '../lib/scoring';
import { ROLE_ORDER } from '../types';
import { ClassLogo } from '../components/ClassLogo';
import { TeamModal } from '../components/TeamModal';
import { StarRating } from '../components/StarRating';

type SortKey = 'name' | 'autoScore' | 'community' | 'finalScore' | 'patch';
type SortDir = 'asc' | 'desc';

const tierColors: Record<string, string> = {
  S: '#ff4d4d', A: '#ff9900', B: '#4da6ff', C: '#8b949e',
};

export function RankingPage() {
  const { classes, loading } = useClasses();
  const { teams, submitRating, hasRated, initialized } = useTeams();
  const [sortKey, setSortKey] = useState<SortKey>('finalScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const selectedTeam = selectedTeamId ? teams.find(t => t.id === selectedTeamId) ?? null : null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const indicator = (key: SortKey) => (
    <span style={{ marginLeft: 4, color: sortKey === key ? '#d4a017' : '#444c56' }}>
      {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const sorted = [...teams].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'name':
        return dir * (a.name ?? '').localeCompare(b.name ?? '');
      case 'patch':
        return dir * (a.patch ?? '').localeCompare(b.patch ?? '');
      case 'autoScore':
        return dir * (a.autoScore - b.autoScore);
      case 'community': {
        const ca = getAverageRating(a.userRatings) ?? -1;
        const cb = getAverageRating(b.userRatings) ?? -1;
        return dir * (ca - cb);
      }
      default: {
        const fa = computeFinalScore(a.autoScore, a.userRatings);
        const fb = computeFinalScore(b.autoScore, b.userRatings);
        return dir * (fa - fb);
      }
    }
  });

  if (loading || !initialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement...</div>;
  }

  const thBase: React.CSSProperties = {
    padding: '0.7rem 1rem',
    color: '#8b949e',
    fontSize: '0.78rem',
    fontWeight: 600,
    textAlign: 'left',
    borderBottom: '2px solid #30363d',
    whiteSpace: 'nowrap',
    background: '#161b22',
    userSelect: 'none',
  };

  const tdBase: React.CSSProperties = {
    padding: '0.6rem 1rem',
    borderBottom: '1px solid #21262d',
    fontSize: '0.85rem',
    verticalAlign: 'middle',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>📊 Classement</h1>
        <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
          {teams.length} équipe{teams.length > 1 ? 's' : ''} — Score final = 30% auto + 70% votes
        </p>
      </div>

      {teams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8b949e', background: '#1c2128', border: '1px solid #30363d', borderRadius: 12 }}>
          Aucune équipe enregistrée.
        </div>
      ) : (
        <div style={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thBase, cursor: 'default', width: 40, textAlign: 'center' }}>#</th>
                <th style={{ ...thBase, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Équipe {indicator('name')}
                </th>
                <th style={{ ...thBase, cursor: 'pointer' }} onClick={() => handleSort('patch')}>
                  Patch {indicator('patch')}
                </th>
                <th style={{ ...thBase, cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('autoScore')}>
                  Score auto {indicator('autoScore')}
                </th>
                <th style={{ ...thBase, cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('community')}>
                  Note commu {indicator('community')}
                </th>
                <th style={{ ...thBase, cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('finalScore')}>
                  Score final {indicator('finalScore')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, idx) => {
                const community = getAverageRating(team.userRatings);
                const final = computeFinalScore(team.autoScore, team.userRatings);
                const tier = getTier(final);
                const tierColor = tierColors[tier];
                const isDefault = team.isRecommended === true;

                return (
                  <tr
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    style={{ background: idx % 2 === 0 ? 'transparent' : '#161b2255', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ffffff08')}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : '#161b2255')}
                  >
                    <td style={{ ...tdBase, textAlign: 'center', color: '#8b949e', fontWeight: 700, fontSize: '0.8rem' }}>
                      {idx + 1}
                    </td>
                    <td style={tdBase}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                          {ROLE_ORDER.map(role => {
                            const cls = classes.find(c => c.id === team.roles[role]);
                            return cls ? <ClassLogo key={role} dofusClass={cls} size={28} /> : null;
                          })}
                        </div>
                        <span style={{ color: '#e6edf3', fontWeight: 600 }}>
                          {team.name ?? '—'}
                        </span>
                        {isDefault && (
                          <span style={{
                            background: 'rgba(212,160,23,0.1)',
                            border: '1px solid rgba(212,160,23,0.3)',
                            color: '#d4a017', borderRadius: 4,
                            padding: '0px 5px', fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap',
                          }}>Huz</span>
                        )}
                      </div>
                    </td>
                    <td style={tdBase}>
                      <span style={{
                        background: 'rgba(212,160,23,0.08)',
                        border: '1px solid rgba(212,160,23,0.2)',
                        color: '#d4a017', borderRadius: 4,
                        padding: '1px 7px', fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {team.patch ?? '3.5'}
                      </span>
                    </td>
                    <td style={{ ...tdBase, textAlign: 'center' }}>
                      <StarRating value={Math.round(team.autoScore / 2)} readonly size={14} showValue={false} />
                    </td>
                    <td style={{ ...tdBase, textAlign: 'center' }}>
                      {community !== null ? (
                        <StarRating value={Math.round(community)} readonly size={14} showValue={false} />
                      ) : (
                        <span style={{ color: '#444c56' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdBase, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <StarRating value={Math.round(final / 2)} readonly size={14} showValue={false} />
                        <span style={{
                          background: `${tierColor}22`, border: `1px solid ${tierColor}`,
                          color: tierColor, borderRadius: 4, padding: '1px 6px',
                          fontSize: '0.68rem', fontWeight: 800,
                        }}>{tier}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
