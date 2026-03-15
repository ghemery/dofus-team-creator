import { useState } from 'react';
import { SavedTeam, DofusClass, ROLE_ORDER, ROLE_LABELS_SHORT, getTier } from '../types';
import { computeFinalScore, getAverageRating, computeTeamDetails, getDamageLevelStyle } from '../lib/scoring';
import { ClassLogo } from './ClassLogo';
import { ScoreBar } from './ScoreBar';
import { StarRating } from './StarRating';

const tierConfig: Record<string, { color: string }> = {
  S: { color: '#ff4d4d' },
  A: { color: '#ff9900' },
  B: { color: '#4da6ff' },
  C: { color: '#8b949e' },
};

interface TeamModalProps {
  team: SavedTeam;
  classes: DofusClass[];
  onClose: () => void;
  onRate: (r: number) => void;
  hasRated: boolean;
}

export function TeamModal({ team, classes, onClose, onRate, hasRated }: TeamModalProps) {
  const [ratingInput, setRatingInput] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);

  const finalScore = computeFinalScore(team.autoScore, team.userRatings);
  const communityAvg = getAverageRating(team.userRatings);
  const tier = getTier(finalScore);
  const details = computeTeamDetails(team.roles, classes);
  const tierColor = tierConfig[tier].color;
  const hasComment = team.comment?.description || team.comment?.strengths || team.comment?.weaknesses;

  const handleRate = () => {
    if (!ratingInput) return;
    onRate(ratingInput);
    setVoted(true);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1c2128',
          border: `1px solid ${tierColor}55`,
          borderRadius: 16,
          maxWidth: 860,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #30363d',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: `${tierColor}08`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: `${tierColor}22`, border: `2px solid ${tierColor}`,
              color: tierColor, borderRadius: 8, padding: '3px 14px',
              fontWeight: 900, fontSize: '1.1rem',
            }}>{tier}</span>
            <span style={{ color: '#e6edf3', fontWeight: 800, fontSize: '1.15rem' }}>
              {team.name ?? 'Équipe'}
            </span>
            <span style={{
              background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)',
              color: '#d4a017', borderRadius: 4, padding: '2px 8px',
              fontSize: '0.72rem', fontWeight: 700,
            }}>Patch {team.patch}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #30363d',
              color: '#8b949e', cursor: 'pointer', fontSize: '1rem',
              padding: '0.3rem 0.7rem', borderRadius: 6, flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b949e'; e.currentTarget.style.color = '#e6edf3'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e'; }}
          >✕ Fermer</button>
        </div>

        {/* Body — 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

          {/* Left: classes + comment */}
          <div style={{ borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column' }}>

            {/* Classes */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #30363d' }}>
              <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.75rem' }}>COMPOSITION</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {ROLE_ORDER.map(role => {
                  const cls = classes.find(c => c.id === team.roles[role]);
                  return (
                    <div key={role} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      background: '#161b22', borderRadius: 10, padding: '0.5rem 0.75rem',
                      border: '1px solid #30363d',
                    }}>
                      {cls ? (
                        <ClassLogo dofusClass={cls} size={44} selected />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1c2128', border: '2px dashed #30363d', flexShrink: 0 }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#8b949e', fontSize: '0.62rem', fontWeight: 600 }}>{ROLE_LABELS_SHORT[role]}</div>
                        {cls && <div style={{ color: cls.color, fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.name}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            {hasComment ? (
              <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {team.comment.description && (
                  <div>
                    <div style={{ color: '#8b949e', fontSize: '0.7rem', fontWeight: 600, marginBottom: 4 }}>DESCRIPTION</div>
                    <p style={{ color: '#e6edf3', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>{team.comment.description}</p>
                  </div>
                )}
                {team.comment.strengths && (
                  <div>
                    <div style={{ color: '#1dd1a1', fontSize: '0.7rem', fontWeight: 600, marginBottom: 4 }}>✅ POINTS FORTS</div>
                    <p style={{ color: '#e6edf3', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>{team.comment.strengths}</p>
                  </div>
                )}
                {team.comment.weaknesses && (
                  <div>
                    <div style={{ color: '#ff6b6b', fontSize: '0.7rem', fontWeight: 600, marginBottom: 4 }}>❌ POINTS FAIBLES</div>
                    <p style={{ color: '#e6edf3', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>{team.comment.weaknesses}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#444c56', fontSize: '0.8rem' }}>Aucune description</span>
              </div>
            )}
          </div>

          {/* Right: scores + range + rating */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Scores */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: 2 }}>SCORES</div>
              <ScoreBar score={team.autoScore} label="Score auto" size="sm" />
              {communityAvg !== null
                ? <ScoreBar score={communityAvg} label="Note communauté" size="sm" />
                : <div style={{ color: '#444c56', fontSize: '0.72rem' }}>Note communauté — aucun vote</div>
              }
              <ScoreBar score={finalScore} label="Score final" size="md" />
            </div>

            {/* By role */}
            {details && (
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: 2 }}>PAR RÔLE</div>
                {ROLE_ORDER.map(role => (
                  <ScoreBar key={role} score={details.byRole[role]} label={ROLE_LABELS_SHORT[role]} size="sm" />
                ))}
              </div>
            )}

            {/* Range profile */}
            {details && (
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #30363d' }}>
                <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.5rem' }}>PORTÉE DE COMBAT</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {([
                    { label: '🏹 Distance', value: details.rangeProfile.range },
                    { label: '⚔️ Mi-dist.', value: details.rangeProfile.midRange },
                    { label: '🗡️ CAC', value: details.rangeProfile.melee },
                  ] as const).map(({ label, value }) => {
                    const { label: lvl, color } = getDamageLevelStyle(value);
                    return (
                      <div key={label} style={{
                        flex: 1, background: `${color}18`, border: `1px solid ${color}44`,
                        borderRadius: 8, padding: '0.5rem 0.3rem', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '0.65rem', color: '#8b949e', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: '0.8rem', color, fontWeight: 700 }}>{lvl}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rating */}
            <div style={{ padding: '1.25rem 1.5rem', flex: 1 }}>
              {hasRated || voted ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.75rem',
                  background: 'rgba(29,209,161,0.07)', border: '1px solid rgba(29,209,161,0.2)',
                  borderRadius: 8, color: '#1dd1a1', fontSize: '0.82rem', fontWeight: 600,
                }}>
                  ✓ Vote enregistré · Moyenne communauté : {communityAvg !== null ? communityAvg.toFixed(1) : (team.autoScore / 2).toFixed(1)} / 5 ★
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600 }}>VOTRE NOTE</div>
                  <StarRating value={ratingInput} onChange={setRatingInput} size={20} showValue />
                  <button
                    onClick={handleRate}
                    disabled={!ratingInput}
                    style={{
                      background: ratingInput ? 'linear-gradient(135deg, #b8860b, #d4a017)' : '#30363d',
                      color: ratingInput ? '#0d1117' : '#8b949e',
                      border: 'none', borderRadius: 8, padding: '0.55rem',
                      fontWeight: 700, cursor: ratingInput ? 'pointer' : 'not-allowed',
                      fontSize: '0.9rem', transition: 'all 0.2s',
                    }}
                  >Voter</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
