import { useState } from 'react';
import { SavedTeam, DofusClass, ROLE_ORDER, ROLE_LABELS_SHORT, getTier } from '../types';
import { computeFinalScore, getAverageRating } from '../lib/scoring';
import { ClassLogo } from './ClassLogo';
import { ScoreBar } from './ScoreBar';
import { StarRating } from './StarRating';

interface TeamCardProps {
  team: SavedTeam;
  classes: DofusClass[];
  onRate?: (rating: number) => void;
  onDelete?: () => void;
  hasRated?: boolean;
  compact?: boolean;
}

const tierBadgeStyle: Record<string, React.CSSProperties> = {
  S: { background: 'rgba(255,77,77,0.15)', border: '1px solid #ff4d4d', color: '#ff4d4d' },
  A: { background: 'rgba(255,153,0,0.15)', border: '1px solid #ff9900', color: '#ff9900' },
  B: { background: 'rgba(77,166,255,0.15)', border: '1px solid #4da6ff', color: '#4da6ff' },
  C: { background: 'rgba(139,148,158,0.15)', border: '1px solid #8b949e', color: '#8b949e' },
};

export function TeamCard({ team, classes, onRate, onDelete, hasRated, compact }: TeamCardProps) {
  const [ratingInput, setRatingInput] = useState<number | null>(null);
  const [showComment, setShowComment] = useState(false);
  const avgRating = getAverageRating(team.userRatings);
  const finalScore = computeFinalScore(team.autoScore, team.userRatings);
  const tier = getTier(finalScore);

  const getClass = (id: string | null) => classes.find(c => c.id === id) ?? null;

  const hasComment = team.comment && (
    team.comment.description || team.comment.strengths || team.comment.weaknesses
  );

  return (
    <div style={{
      background: '#1c2128',
      border: '1px solid #30363d',
      borderRadius: 12,
      padding: compact ? '0.75rem' : '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {team.name && (
            <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.95rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {team.name}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(212,160,23,0.15)',
              border: '1px solid rgba(212,160,23,0.4)',
              color: '#d4a017',
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: '0.68rem',
              fontWeight: 700,
            }}>
              Patch {team.patch ?? '3.5'}
            </span>
            <span style={{ color: '#8b949e', fontSize: '0.68rem' }}>
              {new Date(team.createdAt).toLocaleDateString('fr-FR')}
            </span>
            {team.userRatings.length > 0 && (
              <span style={{ color: '#8b949e', fontSize: '0.68rem' }}>
                {team.userRatings.length} vote{team.userRatings.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <span style={{
            ...tierBadgeStyle[tier],
            borderRadius: 6,
            padding: '2px 10px',
            fontWeight: 800,
            fontSize: '0.9rem',
          }}>
            {tier}
          </span>
          {onDelete && (
            <button onClick={onDelete} style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1rem', padding: '2px 4px' }} title="Supprimer">
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Classes */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {ROLE_ORDER.map(role => {
          const cls = getClass(team.roles[role]);
          return (
            <div key={role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              {cls ? (
                <ClassLogo dofusClass={cls} size={compact ? 44 : 52} selected />
              ) : (
                <div style={{
                  width: compact ? 44 : 52,
                  height: compact ? 44 : 52,
                  borderRadius: '50%',
                  background: '#161b22',
                  border: '2px dashed #30363d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#30363d',
                  fontSize: '1.2rem',
                }}>?</div>
              )}
              <span style={{ fontSize: '0.58rem', color: '#8b949e', textAlign: 'center' }}>
                {ROLE_LABELS_SHORT[role]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scores */}
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <ScoreBar score={team.autoScore} label="Score auto" size="sm" />
          {avgRating !== null && <ScoreBar score={avgRating} label="Note communauté" size="sm" />}
          <ScoreBar score={finalScore} label="Score final" size="md" />
        </div>
      )}

      {/* Comment toggle */}
      {hasComment && (
        <button
          onClick={() => setShowComment(!showComment)}
          style={{
            background: 'transparent',
            border: '1px solid #30363d',
            borderRadius: 6,
            color: '#8b949e',
            padding: '0.35rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          {showComment ? '▲' : '▼'} {showComment ? 'Masquer' : 'Voir'} la description
        </button>
      )}

      {/* Comment content */}
      {showComment && hasComment && (
        <div style={{ borderTop: '1px solid #30363d', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {team.comment.description && (
            <div>
              <div style={{ color: '#8b949e', fontSize: '0.7rem', fontWeight: 600, marginBottom: 3 }}>DESCRIPTION</div>
              <p style={{ color: '#e6edf3', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{team.comment.description}</p>
            </div>
          )}
          {team.comment.strengths && (
            <div>
              <div style={{ color: '#1dd1a1', fontSize: '0.7rem', fontWeight: 600, marginBottom: 3 }}>✅ POINTS FORTS</div>
              <p style={{ color: '#e6edf3', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{team.comment.strengths}</p>
            </div>
          )}
          {team.comment.weaknesses && (
            <div>
              <div style={{ color: '#ff6b6b', fontSize: '0.7rem', fontWeight: 600, marginBottom: 3 }}>❌ POINTS FAIBLES</div>
              <p style={{ color: '#e6edf3', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{team.comment.weaknesses}</p>
            </div>
          )}
        </div>
      )}

      {/* Rating */}
      {onRate && (
        <div style={{ borderTop: '1px solid #30363d', paddingTop: '0.5rem' }}>
          {hasRated ? (
            <div style={{ color: '#8b949e', fontSize: '0.75rem', textAlign: 'center' }}>
              ✓ Vous avez déjà voté · Moyenne : {avgRating ?? team.autoScore}/10
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>Votre note :</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StarRating value={ratingInput} onChange={setRatingInput} size={16} showValue={false} />
                <button
                  onClick={() => ratingInput && onRate(ratingInput)}
                  disabled={!ratingInput}
                  style={{
                    background: ratingInput ? 'linear-gradient(135deg, #b8860b, #d4a017)' : '#30363d',
                    color: ratingInput ? '#0d1117' : '#8b949e',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.3rem 0.75rem',
                    fontWeight: 700,
                    cursor: ratingInput ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    marginLeft: 'auto',
                  }}
                >Voter</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
