import { useState, useMemo } from 'react';
import { DofusClass, ClassStats, ROLE_ORDER, ROLE_LABELS, ROLE_COLORS, STAT_LABELS, STAT_ICONS } from '../types';
import { computeRoleScore, computePerfectRole } from '../lib/scoring';
import { rateClass, hasRatedClass } from '../lib/storage';
import { ClassLogo } from './ClassLogo';
import { StarRating } from './StarRating';

interface ClassRatingModalProps {
  cls: DofusClass;
  communityStats: ClassStats | null;
  voteCount: number;
  onClose: () => void;
  onVoted: () => void;
}

export function ClassRatingModal({ cls, communityStats, voteCount, onClose, onVoted }: ClassRatingModalProps) {
  const defaultStats = communityStats ?? cls.stats;
  const [draft, setDraft] = useState<ClassStats>({ ...defaultStats });
  const [saving, setSaving] = useState(false);
  const [voted, setVoted] = useState(false);
  const alreadyVoted = hasRatedClass(cls.id);

  // stats stored 0–10, stars displayed 0–5 (×2 to store, ÷2 to display)
  const updateStat = (key: keyof ClassStats, stars: number) =>
    setDraft(prev => ({ ...prev, [key]: Math.round(stars * 2 * 10) / 10 }));

  const previewCls = useMemo(() => ({ ...cls, stats: draft }), [cls, draft]);
  const perfectRole = useMemo(() => computePerfectRole(draft), [draft]);

  const handleVote = async () => {
    setSaving(true);
    try {
      await rateClass(cls.id, draft);
      setVoted(true);
      onVoted();
    } finally {
      setSaving(false);
    }
  };

  const canVote = !alreadyVoted && !voted;

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
          border: `1px solid ${cls.color}55`,
          borderRadius: 16,
          maxWidth: 820,
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
          background: `${cls.color}08`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClassLogo dofusClass={cls} size={44} />
            <div>
              <div style={{ color: cls.color, fontWeight: 800, fontSize: '1.15rem' }}>{cls.name}</div>
              <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>
                {voteCount > 0
                  ? `${voteCount} vote${voteCount > 1 ? 's' : ''} communautaire${voteCount > 1 ? 's' : ''}`
                  : 'Aucun vote pour le moment — statistiques officielles affichées'}
              </div>
            </div>
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

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

          {/* Left: star ratings per stat */}
          <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: 4 }}>
              {canVote ? 'VOS NOTES PAR STATISTIQUE' : 'STATS COMMUNAUTAIRES ACTUELLES'}
            </div>
            {(Object.keys(draft) as (keyof ClassStats)[]).map(key => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#8b949e', whiteSpace: 'nowrap', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {STAT_ICONS[key]} {STAT_LABELS[key]}
                </span>
                <StarRating
                  allowHalf
                  value={draft[key] / 2}
                  onChange={canVote ? (v => updateStat(key, v)) : undefined}
                  readonly={!canVote}
                  size={16}
                  showValue={false}
                />
              </div>
            ))}
          </div>

          {/* Right: role preview + vote */}
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                APERÇU PAR RÔLE
                {canVote && <span style={{ color: '#4da6ff', marginLeft: 6 }}>— mis à jour en direct</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {ROLE_ORDER.map(role => {
                  const score = computeRoleScore(previewCls, role);
                  const isBest = role === perfectRole;
                  const color = ROLE_COLORS[role];
                  return (
                    <div
                      key={role}
                      style={{
                        background: isBest ? `${color}12` : '#161b22',
                        border: `1px solid ${isBest ? color + '55' : '#30363d'}`,
                        borderRadius: 8,
                        padding: '0.6rem 0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isBest && <span style={{ fontSize: '0.7rem' }}>⭐</span>}
                        <span style={{
                          color: isBest ? color : '#8b949e',
                          fontWeight: isBest ? 700 : 400,
                          fontSize: '0.82rem',
                        }}>
                          {ROLE_LABELS[role]}
                        </span>
                      </div>
                      <StarRating allowHalf value={score / 2} readonly size={16} showValue={false} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vote section */}
            <div style={{ marginTop: 'auto' }}>
              {voted || alreadyVoted ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.75rem',
                  background: 'rgba(29,209,161,0.07)', border: '1px solid rgba(29,209,161,0.2)',
                  borderRadius: 8, color: '#1dd1a1', fontSize: '0.82rem', fontWeight: 600,
                }}>
                  ✓ Vote enregistré — merci pour ta contribution !
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: '#8b949e', fontSize: '0.72rem' }}>
                    Attribue des étoiles à chaque statistique selon ta perception de la classe.
                  </div>
                  <button
                    onClick={handleVote}
                    disabled={saving}
                    className="dofus-btn"
                    style={{ width: '100%' }}
                  >
                    {saving ? 'Envoi...' : '⭐ Soumettre mon vote'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
