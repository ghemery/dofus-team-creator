import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DofusClass, ClassStats, TeamRoles, TeamComment, ROLE_ORDER, ROLE_LABELS_SHORT, AVAILABLE_PATCHES, CURRENT_PATCH, EMPTY_COMMENT, PreferredRole, PREFERRED_ROLE_EMOJI, AppUser, STAT_LABELS } from '../types';
import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { saveClassesToStorage, exportClassesJson } from '../lib/storage';
import { computeTeamDetails } from '../lib/scoring';
import { ClassLogo } from '../components/ClassLogo';
import { StarRating } from '../components/StarRating';
import { apiCreateRecommendedTeam, apiUpdateRecommendedTeam, apiDeleteRecommendedTeam, apiGetUsers, apiSetUserRole, apiDeleteUser, apiChangePassword } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// ─── Class Editor ─────────────────────────────────────────────────────────────

function ClassEditor({ cls, allClasses, onChange }: { cls: DofusClass; allClasses: DofusClass[]; onChange: (updated: DofusClass) => void }) {
  const [expanded, setExpanded] = useState(false);

  const updateStat = (stat: keyof ClassStats, val: number) =>
    onChange({ ...cls, stats: { ...cls.stats, [stat]: Math.round(val * 20) / 10 } });

  const toggleIncompat = (otherId: string) => {
    const already = cls.incompatibleWith.includes(otherId);
    onChange({ ...cls, incompatibleWith: already ? cls.incompatibleWith.filter(id => id !== otherId) : [...cls.incompatibleWith, otherId] });
  };

  const togglePreferredRole = (role: PreferredRole) => {
    const current = cls.preferredRoles ?? [];
    const has = current.includes(role);
    onChange({ ...cls, preferredRoles: has ? current.filter(r => r !== role) : [...current, role] });
  };

  const ALL_PREFERRED: PreferredRole[] = ['tank', 'soutien', 'dpt', 'hybride'];

  return (
    <div className="dofus-card" style={{ overflow: 'hidden', border: expanded ? `1px solid ${cls.color}55` : '1px solid #30363d' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: expanded ? `${cls.color}0d` : 'transparent' }}
      >
        <ClassLogo dofusClass={cls} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ color: cls.color, fontWeight: 700 }}>{cls.name}</div>
          {(cls.preferredRoles ?? []).length > 0 && (
            <div style={{ fontSize: '0.7rem', marginTop: 2 }}>
              {(cls.preferredRoles ?? []).map(r => PREFERRED_ROLE_EMOJI[r]).join(' ')}
            </div>
          )}
          {cls.incompatibleWith.length > 0 && (
            <div style={{ color: '#ff6b6b', fontSize: '0.7rem' }}>⚠️ Incompatible avec {cls.incompatibleWith.length} classe(s)</div>
          )}
        </div>
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '1rem', borderTop: `1px solid ${cls.color}33` }}>
          {/* Logo URL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
              URL du logo (PNG/JPG — laisser vide pour avatar généré)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={cls.logoUrl}
                onChange={e => onChange({ ...cls, logoUrl: e.target.value })}
                placeholder="https://example.com/class-icon.png"
                style={{
                  flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 6,
                  color: '#e6edf3', padding: '0.5rem 0.7rem', fontSize: '0.8rem', outline: 'none',
                }}
              />
              {cls.logoUrl && <ClassLogo dofusClass={cls} size={36} />}
            </div>
          </div>

          {/* Preferred Roles */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>RÔLES DE PRÉDILECTION</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {ALL_PREFERRED.map(role => {
                const active = (cls.preferredRoles ?? []).includes(role);
                return (
                  <button key={role} onClick={() => togglePreferredRole(role)} style={{
                    background: active ? 'rgba(212,160,23,0.15)' : '#161b22',
                    border: `1px solid ${active ? '#d4a017' : '#30363d'}`,
                    borderRadius: 6, color: active ? '#d4a017' : '#8b949e',
                    padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer',
                    fontWeight: active ? 700 : 400, transition: 'all 0.15s',
                  }}>
                    {PREFERRED_ROLE_EMOJI[role]} {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats (star rating) */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>STATISTIQUES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {(Object.keys(cls.stats) as (keyof ClassStats)[]).map(stat => (
                <div key={stat} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: '#8b949e', fontSize: '0.68rem' }}>{STAT_LABELS[stat]}</span>
                  <StarRating
                    allowHalf
                    value={cls.stats[stat] / 2}
                    onChange={v => updateStat(stat, v)}
                    size={16}
                    showValue={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Incompatibilities */}
          <div>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>DÉCONSEILLÉ AVEC</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {allClasses.filter(c => c.id !== cls.id).map(other => {
                const active = cls.incompatibleWith.includes(other.id);
                return (
                  <button key={other.id} onClick={() => toggleIncompat(other.id)} style={{
                    background: active ? `${other.color}22` : '#161b22',
                    border: `1px solid ${active ? other.color : '#30363d'}`,
                    borderRadius: 6, color: active ? other.color : '#8b949e',
                    padding: '0.25rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer',
                    fontWeight: active ? 700 : 400, transition: 'all 0.15s',
                  }}>
                    {active ? '✕ ' : ''}{other.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recommended Team Form ────────────────────────────────────────────────────

const emptyRoles: TeamRoles = { tank: null, soutienPolyvalent: null, dpt: null, dpt2: null };

function RecommendedTeamForm({
  classes,
  token,
  initial,
  onSave,
  onCancel,
}: {
  classes: DofusClass[];
  token: string;
  initial?: { id: string; name: string; patch: string; roles: TeamRoles; comment: TeamComment };
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [patch, setPatch] = useState(initial?.patch ?? CURRENT_PATCH);
  const [roles, setRoles] = useState<TeamRoles>(initial?.roles ?? emptyRoles);
  const [comment, setComment] = useState<TeamComment>(initial?.comment ?? EMPTY_COMMENT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isComplete = ROLE_ORDER.every(r => roles[r] !== null);
  const teamDetails = isComplete ? computeTeamDetails(roles, classes) : null;
  const autoScore = teamDetails?.overall ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || !name.trim()) { setError('Nom et 4 classes requis'); return; }
    setSaving(true);
    try {
      if (initial) {
        await apiUpdateRecommendedTeam(initial.id, roles, autoScore, patch, comment, name, token);
      } else {
        await apiCreateRecommendedTeam(roles, autoScore, patch, comment, name, token);
      }
      onSave();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    background: '#161b22', border: '1px solid #30363d', borderRadius: 6,
    color: '#e6edf3', padding: '0.45rem 0.6rem', fontSize: '0.82rem', outline: 'none', width: '100%',
  };

  const textareaStyle: React.CSSProperties = {
    background: '#161b22', border: '1px solid #30363d', borderRadius: 6,
    color: '#e6edf3', padding: '0.5rem 0.7rem', fontSize: '0.8rem', outline: 'none',
    width: '100%', resize: 'vertical', minHeight: 60, boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#8b949e', fontSize: '0.72rem', display: 'block', marginBottom: 3 }}>Nom de l'équipe *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Team Cra..." style={{ ...selectStyle }} />
        </div>
        <div style={{ width: 100 }}>
          <label style={{ color: '#8b949e', fontSize: '0.72rem', display: 'block', marginBottom: 3 }}>Patch</label>
          <select value={patch} onChange={e => setPatch(e.target.value)} style={selectStyle}>
            {AVAILABLE_PATCHES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.4rem' }}>COMPOSITION (4 rôles)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {ROLE_ORDER.map(role => (
            <div key={role}>
              <label style={{ color: '#8b949e', fontSize: '0.7rem', display: 'block', marginBottom: 2 }}>{ROLE_LABELS_SHORT[role]}</label>
              <select value={roles[role] ?? ''} onChange={e => setRoles(prev => ({ ...prev, [role]: e.target.value || null }))} style={selectStyle}>
                <option value="">— Sélectionner —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        {isComplete && (
          <div style={{ marginTop: '0.4rem', color: '#d4a017', fontSize: '0.75rem' }}>
            Score auto calculé : <strong>{(autoScore / 2).toFixed(1)} ★ / 5</strong>
          </div>
        )}
      </div>

      <div>
        <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.4rem' }}>COMMENTAIRE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <textarea value={comment.description} onChange={e => setComment(prev => ({ ...prev, description: e.target.value }))} placeholder="Description de la composition..." style={textareaStyle} />
          <textarea value={comment.strengths} onChange={e => setComment(prev => ({ ...prev, strengths: e.target.value }))} placeholder="Points forts..." style={{ ...textareaStyle, minHeight: 48 }} />
          <textarea value={comment.weaknesses} onChange={e => setComment(prev => ({ ...prev, weaknesses: e.target.value }))} placeholder="Points faibles..." style={{ ...textareaStyle, minHeight: 48 }} />
        </div>
      </div>

      {error && <div style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="dofus-btn-outline" style={{ fontSize: '0.8rem' }}>Annuler</button>
        <button type="submit" className="dofus-btn" disabled={saving || !isComplete || !name.trim()} style={{ fontSize: '0.8rem' }}>
          {saving ? 'Sauvegarde...' : initial ? '✓ Modifier' : '+ Créer'}
        </button>
      </div>
    </form>
  );
}

// ─── Recommended Teams Section ────────────────────────────────────────────────

function RecommendedTeamsSection({ classes, token, onRefresh }: { classes: DofusClass[]; token: string; onRefresh: () => void }) {
  const { teams } = useTeams();
  const recommended = teams.filter(t => t.isRecommended === true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette équipe recommandée ?')) return;
    setDeleting(id);
    try {
      await apiDeleteRecommendedTeam(id, token);
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => { setShowForm(false); setEditingId(null); onRefresh(); };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🏆 Équipes Recommandées</div>
          <div style={{ color: '#8b949e', fontSize: '0.78rem' }}>{recommended.length} équipe{recommended.length > 1 ? 's' : ''} — visibles dans la Tier List</div>
        </div>
        {!showForm && !editingId && (
          <button onClick={() => setShowForm(true)} className="dofus-btn" style={{ fontSize: '0.8rem' }}>+ Nouvelle équipe</button>
        )}
      </div>

      {showForm && (
        <div className="dofus-card" style={{ padding: '1rem', marginBottom: '0.75rem', border: '1px solid rgba(212,160,23,0.3)' }}>
          <div style={{ color: '#d4a017', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem' }}>Nouvelle équipe recommandée</div>
          <RecommendedTeamForm classes={classes} token={token} onSave={handleSaved} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommended.map(team => (
          <div key={team.id} className="dofus-card" style={{ padding: '0.75rem 1rem', border: '1px solid #30363d' }}>
            {editingId === team.id ? (
              <>
                <div style={{ color: '#d4a017', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem' }}>Modifier : {team.name}</div>
                <RecommendedTeamForm classes={classes} token={token} initial={{ id: team.id, name: team.name ?? '', patch: team.patch, roles: team.roles, comment: team.comment }} onSave={handleSaved} onCancel={() => setEditingId(null)} />
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                  {ROLE_ORDER.map(role => {
                    const cls = classes.find(c => c.id === team.roles[role]);
                    return cls ? <ClassLogo key={role} dofusClass={cls} size={30} /> : null;
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.88rem' }}>{team.name ?? '—'}</span>
                  <span style={{ color: '#8b949e', fontSize: '0.72rem', marginLeft: '0.5rem' }}>patch {team.patch} — {(team.autoScore / 2).toFixed(1)} ★</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => setEditingId(team.id)} className="dofus-btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>✏️ Modifier</button>
                  <button onClick={() => handleDelete(team.id)} disabled={deleting === team.id} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    {deleting === team.id ? '...' : '🗑️ Supprimer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {recommended.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8b949e', border: '1px dashed #30363d', borderRadius: 8, fontSize: '0.82rem' }}>
            Aucune équipe recommandée. Créez-en une !
          </div>
        )}
      </div>
    </div>
  );
}

// ─── User Management Section ──────────────────────────────────────────────────

function UsersSection({ token, currentUserId }: { token: string; currentUserId: string }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await apiGetUsers(token));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [token]);

  const handleSetRole = async (id: string, role: 'user' | 'admin') => {
    setActionId(id);
    try {
      await apiSetUserRole(id, role, token);
      await loadUsers();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Supprimer l'utilisateur "${username}" ?`)) return;
    setActionId(id);
    try {
      await apiDeleteUser(id, token);
      await loadUsers();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div style={{ color: '#8b949e', padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>👥 Gestion des utilisateurs</div>
      {error && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {users.map(u => (
          <div key={u.id} className="dofus-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #30363d' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.88rem' }}>
                {u.username}
                {u.id === currentUserId && <span style={{ color: '#8b949e', fontWeight: 400, fontSize: '0.75rem', marginLeft: 6 }}>(vous)</span>}
              </div>
              <div style={{ color: '#8b949e', fontSize: '0.72rem' }}>{u.email}</div>
            </div>
            <span style={{
              background: u.role === 'admin' ? 'rgba(240,192,64,0.15)' : 'rgba(139,148,158,0.15)',
              color: u.role === 'admin' ? '#f0c040' : '#8b949e',
              border: `1px solid ${u.role === 'admin' ? 'rgba(240,192,64,0.3)' : '#30363d'}`,
              borderRadius: 4, padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 700,
            }}>
              {u.role === 'admin' ? '★ Admin' : 'User'}
            </span>
            {u.id !== currentUserId && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {u.role === 'user' ? (
                  <button onClick={() => handleSetRole(u.id, 'admin')} disabled={actionId === u.id} className="dofus-btn-outline" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
                    Promouvoir admin
                  </button>
                ) : (
                  <button onClick={() => handleSetRole(u.id, 'user')} disabled={actionId === u.id} style={{ background: 'rgba(255,159,67,0.1)', border: '1px solid rgba(255,159,67,0.3)', color: '#ff9f43', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}>
                    Rétrograder
                  </button>
                )}
                <button onClick={() => handleDelete(u.id, u.username)} disabled={actionId === u.id} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}>
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8b949e', border: '1px dashed #30363d', borderRadius: 8, fontSize: '0.82rem' }}>
            Aucun utilisateur enregistré.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export function AdminPage() {
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { classes, setClasses, loading } = useClasses();
  const { refresh } = useTeams();
  const [saved, setSaved] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recommended' | 'classes' | 'users'>('recommended');

  // Redirect if not logged in
  if (!user) {
    navigate('/login?redirect=/admin');
    return null;
  }

  // Access denied if not admin
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 400, margin: '6rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div className="dofus-card" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: '#ff6b6b', margin: '0 0 0.5rem' }}>Accès refusé</h2>
          <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Votre compte n'a pas les droits d'administration.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement...</div>;

  const handleClassChange = async (updated: DofusClass) => {
    const next = classes.map(c => c.id === updated.id ? updated : c);
    setClasses(next);
    setSaved(false);
    await saveClassesToStorage(next, token!);
  };

  const handleSave = async () => {
    await saveClassesToStorage(classes, token!);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePwd = async () => {
    if (newPwd.length < 4) { setPwdMsg('Mot de passe trop court (min. 4 caractères)'); return; }
    try {
      await apiChangePassword(token!, newPwd);
      setPwdMsg('Mot de passe mis à jour !');
      setNewPwd('');
    } catch (e) {
      setPwdMsg((e as Error).message);
    }
    setTimeout(() => setPwdMsg(''), 3000);
  };

  const filtered = searchQuery ? classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : classes;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.2rem',
    background: active ? 'rgba(212,160,23,0.15)' : 'transparent',
    border: `1px solid ${active ? 'rgba(212,160,23,0.4)' : '#30363d'}`,
    borderRadius: 6,
    color: active ? '#d4a017' : '#8b949e',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: active ? 700 : 400,
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>⚙️ Administration</h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Bienvenue, <strong style={{ color: '#e6edf3' }}>{user.username}</strong></p>
        </div>
        {activeTab === 'classes' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {saved && <span style={{ color: '#1dd1a1', fontSize: '0.85rem' }}>✓ Sauvegardé</span>}
            <button onClick={handleSave} className="dofus-btn-outline">💾 Sauvegarder</button>
            <button onClick={() => exportClassesJson(classes)} className="dofus-btn">⬇️ Exporter JSON</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button style={tabStyle(activeTab === 'recommended')} onClick={() => setActiveTab('recommended')}>🏆 Équipes</button>
        <button style={tabStyle(activeTab === 'classes')} onClick={() => setActiveTab('classes')}>⚔️ Classes</button>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>👥 Utilisateurs</button>
      </div>

      {/* Tab: Recommended Teams */}
      {activeTab === 'recommended' && (
        <RecommendedTeamsSection classes={classes} token={token!} onRefresh={refresh} />
      )}

      {/* Tab: Classes */}
      {activeTab === 'classes' && (
        <>
          <div style={{ background: 'rgba(77,166,255,0.08)', border: '1px solid rgba(77,166,255,0.25)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#4da6ff' }}>
            ℹ️ <strong>Déployer les changements :</strong> Cliquez sur "Exporter JSON", puis remplacez <code>public/data/classes.json</code> dans votre dépôt GitHub et commitez.
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 Rechercher une classe..."
            style={{ width: '100%', background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', padding: '0.65rem 0.9rem', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {filtered.map(cls => (
              <ClassEditor key={cls.id} cls={cls} allClasses={classes} onChange={handleClassChange} />
            ))}
          </div>
        </>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && <UsersSection token={token!} currentUserId={user.id} />}

      {/* Change password */}
      <div className="dofus-card" style={{ padding: '1rem', marginTop: '2rem' }}>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>CHANGER LE MOT DE PASSE ADMIN (legacy)</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            placeholder="Nouveau mot de passe"
            style={{ flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', padding: '0.6rem 0.8rem', fontSize: '0.85rem', outline: 'none' }}
          />
          <button onClick={handleChangePwd} className="dofus-btn-outline">Changer</button>
        </div>
        {pwdMsg && <div style={{ color: pwdMsg.includes('!') ? '#1dd1a1' : '#ff6b6b', fontSize: '0.75rem', marginTop: 6 }}>{pwdMsg}</div>}
      </div>
    </div>
  );
}
