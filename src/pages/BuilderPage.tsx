import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamRoles, RoleType, ROLE_ORDER, ROLE_LABELS, AVAILABLE_PATCHES, CURRENT_PATCH, TeamComment, EMPTY_COMMENT, STAT_LABELS, STAT_ICONS } from '../types';
import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { computeAutoScore } from '../lib/scoring';
import { RoleSlot } from '../components/RoleSlot';
import { ScoreBar, StatGrid } from '../components/ScoreBar';
import { ClassLogo } from '../components/ClassLogo';

const defaultRoles: TeamRoles = {
  tank: null,
  soutienPolyvalent: null,
  dpt: null,
  dpt2: null,
};

export function BuilderPage() {
  const { classes, loading } = useClasses();
  const { addTeam } = useTeams();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<TeamRoles>(defaultRoles);
  const [teamName, setTeamName] = useState('');
  const [patch, setPatch] = useState(CURRENT_PATCH);
  const [comment, setComment] = useState<TeamComment>(EMPTY_COMMENT);
  const [saved, setSaved] = useState(false);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [showComment, setShowComment] = useState(false);

  const isComplete = ROLE_ORDER.every(r => roles[r] !== null);
  const autoScore = isComplete ? computeAutoScore(roles, classes) : 0;

  const handleSelect = (role: RoleType) => (classId: string | null) => {
    setRoles(prev => ({ ...prev, [role]: classId }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!isComplete) return;
    addTeam(roles, autoScore, patch, comment, teamName || undefined);
    setSaved(true);
  };

  const handleReset = () => {
    setRoles(defaultRoles);
    setTeamName('');
    setPatch(CURRENT_PATCH);
    setComment(EMPTY_COMMENT);
    setSaved(false);
  };

  const detailClass = activeDetail ? classes.find(c => c.id === activeDetail) ?? null : null;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement des classes...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>⚔️ Créer votre équipe</h1>
        <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          Sélectionnez une classe pour chaque rôle. La même classe peut être choisie plusieurs fois.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Role slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ROLE_ORDER.map(role => (
            <RoleSlot key={role} role={role} selectedClassId={roles[role]} classes={classes} onSelect={handleSelect(role)} />
          ))}

          {/* Name + Patch */}
          <div className="dofus-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Nom de l'équipe (optionnel)"
                style={{
                  flex: 1,
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 8,
                  color: '#e6edf3',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <select
                value={patch}
                onChange={e => setPatch(e.target.value)}
                style={{
                  background: '#161b22',
                  border: '1px solid rgba(212,160,23,0.4)',
                  borderRadius: 8,
                  color: '#d4a017',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {AVAILABLE_PATCHES.map(p => (
                  <option key={p} value={p}>Patch {p}</option>
                ))}
              </select>
            </div>

            {/* Comment toggle */}
            <button
              onClick={() => setShowComment(!showComment)}
              style={{
                background: 'transparent',
                border: '1px dashed #30363d',
                borderRadius: 8,
                color: '#8b949e',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textAlign: 'left',
              }}
            >
              {showComment ? '▲ Masquer' : '▼ Ajouter'} une description (points forts, faibles...)
            </button>

            {showComment && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { field: 'description' as keyof TeamComment, label: '📝 Description / Fonctionnement', placeholder: 'Expliquez le fonctionnement de l\'équipe...' },
                  { field: 'strengths' as keyof TeamComment, label: '✅ Points forts', placeholder: 'Mobilité, burst, contrôle...' },
                  { field: 'weaknesses' as keyof TeamComment, label: '❌ Points faibles', placeholder: 'Setup long, vulnérable au CAC...' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label style={{ color: '#8b949e', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>{label}</label>
                    <textarea
                      value={comment[field]}
                      onChange={e => setComment(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      rows={2}
                      style={{
                        width: '100%',
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: 6,
                        color: '#e6edf3',
                        padding: '0.5rem 0.7rem',
                        fontSize: '0.8rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {saved ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(29,209,161,0.1)',
                  border: '1px solid rgba(29,209,161,0.3)',
                  borderRadius: 8,
                  color: '#1dd1a1',
                  padding: '0.6rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}>
                  ✓ Équipe sauvegardée !
                </div>
                <button onClick={() => navigate('/tierlist')} className="dofus-btn-outline" style={{ whiteSpace: 'nowrap' }}>
                  Voir le classement
                </button>
                <button onClick={handleReset} style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 8, color: '#8b949e', padding: '0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Réinitialiser
                </button>
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={!isComplete}
                style={{
                  background: isComplete ? 'linear-gradient(135deg, #b8860b, #d4a017)' : '#30363d',
                  color: isComplete ? '#0d1117' : '#8b949e',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.7rem',
                  fontWeight: 700,
                  cursor: isComplete ? 'pointer' : 'not-allowed',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                }}
              >
                {isComplete ? '💾 Sauvegarder l\'équipe' : 'Complétez les 4 rôles pour sauvegarder'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 80 }}>
          {/* Score */}
          <div className="dofus-card" style={{ padding: '1rem' }}>
            <div style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 600 }}>SCORE DE L'ÉQUIPE</div>
            <ScoreBar score={isComplete ? autoScore : 0} label="Auto-score" size="lg" />
            {!isComplete && <div style={{ color: '#8b949e', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>Complétez tous les rôles</div>}
          </div>

          {/* Team preview */}
          <div className="dofus-card" style={{ padding: '1rem' }}>
            <div style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 600 }}>APERÇU</div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {ROLE_ORDER.map(role => {
                const cls = roles[role] ? classes.find(c => c.id === roles[role]) : null;
                return (
                  <div key={role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    {cls ? (
                      <div onClick={() => setActiveDetail(activeDetail === cls.id ? null : cls.id)} style={{ cursor: 'pointer' }}>
                        <ClassLogo dofusClass={cls} size={44} selected />
                      </div>
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed #30363d', background: '#161b22' }} />
                    )}
                    <span style={{ fontSize: '0.55rem', color: '#8b949e', textAlign: 'center' }}>
                      {ROLE_LABELS[role].split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Class detail */}
          {detailClass && (
            <div className="dofus-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ color: detailClass.color, fontWeight: 700 }}>{detailClass.name}</div>
                <button onClick={() => setActiveDetail(null)} style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer' }}>✕</button>
              </div>
              <StatGrid
                stats={detailClass.stats as unknown as Record<string, number>}
                labels={STAT_LABELS as unknown as Record<string, string>}
                icons={STAT_ICONS as unknown as Record<string, string>}
              />
              {detailClass.incompatibleWith.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#ff6b6b' }}>
                  ⚠️ Déconseillé avec :{' '}
                  {detailClass.incompatibleWith.map(id => classes.find(c => c.id === id)?.name ?? id).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
