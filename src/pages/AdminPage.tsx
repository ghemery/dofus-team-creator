import { useState } from 'react';
import { DofusClass, ClassStats, TeamRoles, TeamComment, ROLE_ORDER, ROLE_LABELS_SHORT, AVAILABLE_PATCHES, CURRENT_PATCH, EMPTY_COMMENT } from '../types';
import { useClasses } from '../hooks/useClasses';
import { useTeams } from '../hooks/useTeams';
import { saveClassesToStorage, exportClassesJson, checkAdminPassword, setAdminPassword } from '../lib/storage';
import { computeTeamDetails } from '../lib/scoring';
import { ClassLogo } from '../components/ClassLogo';
import { StatSlider } from '../components/StatSlider';
import { apiCreateRecommendedTeam, apiUpdateRecommendedTeam, apiDeleteRecommendedTeam } from '../lib/api';

// ─── Login ────────────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: (pwd: string) => void }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await checkAdminPassword(pwd);
    setLoading(false);
    if (ok) {
      onLogin(pwd);
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '6rem auto', padding: '0 1rem' }}>
      <div className="dofus-card" style={{ padding: '2rem' }}>
        <h2 style={{ color: '#d4a017', textAlign: 'center', margin: '0 0 1.5rem' }}>⚙️ Administration</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: '#8b949e', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Mot de passe admin</label>
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="Entrez le mot de passe"
              autoFocus
              style={{
                width: '100%', background: '#161b22',
                border: `1px solid ${error ? '#ff6b6b' : '#30363d'}`,
                borderRadius: 8, color: '#e6edf3', padding: '0.7rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {error && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 4 }}>{error}</div>}
          </div>
          <button type="submit" className="dofus-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div style={{ marginTop: '1rem', color: '#8b949e', fontSize: '0.72rem', textAlign: 'center' }}>
          Mot de passe par défaut : <code style={{ color: '#d4a017' }}>admin1234</code>
        </div>
      </div>
    </div>
  );
}

// ─── Class Editor ─────────────────────────────────────────────────────────────

function ClassEditor({ cls, allClasses, onChange }: { cls: DofusClass; allClasses: DofusClass[]; onChange: (updated: DofusClass) => void }) {
  const [expanded, setExpanded] = useState(false);

  const updateStat = (stat: keyof ClassStats, val: number) => onChange({ ...cls, stats: { ...cls.stats, [stat]: val } });
  const toggleIncompat = (otherId: string) => {
    const already = cls.incompatibleWith.includes(otherId);
    onChange({ ...cls, incompatibleWith: already ? cls.incompatibleWith.filter(id => id !== otherId) : [...cls.incompatibleWith, otherId] });
  };

  return (
    <div className="dofus-card" style={{ overflow: 'hidden', border: expanded ? `1px solid ${cls.color}55` : '1px solid #30363d' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: expanded ? `${cls.color}0d` : 'transparent' }}
      >
        <ClassLogo dofusClass={cls} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ color: cls.color, fontWeight: 700 }}>{cls.name}</div>
          {cls.incompatibleWith.length > 0 && (
            <div style={{ color: '#ff6b6b', fontSize: '0.7rem' }}>⚠️ Incompatible avec {cls.incompatibleWith.length} classe(s)</div>
          )}
          {cls.logoUrl && (
            <div style={{ color: '#1dd1a1', fontSize: '0.68rem' }}>🖼️ Logo personnalisé</div>
          )}
        </div>
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '1rem', borderTop: `1px solid ${cls.color}33` }}>
          {/* Logo URL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
              URL du logo (PNG/JPG recommandé — laisser vide pour avatar généré)
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
              {cls.logoUrl && (
                <div style={{ flexShrink: 0 }}>
                  <ClassLogo dofusClass={cls} size={36} />
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>STATISTIQUES (0–10)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {(Object.keys(cls.stats) as (keyof ClassStats)[]).map(stat => (
                <StatSlider key={stat} statKey={stat} value={cls.stats[stat]} onChange={val => updateStat(stat, val)} />
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
  adminPassword,
  initial,
  onSave,
  onCancel,
}: {
  classes: DofusClass[];
  adminPassword: string;
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
        await apiUpdateRecommendedTeam(initial.id, roles, autoScore, patch, comment, name, adminPassword);
      } else {
        await apiCreateRecommendedTeam(roles, autoScore, patch, comment, name, adminPassword);
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
      {/* Name + Patch */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#8b949e', fontSize: '0.72rem', display: 'block', marginBottom: 3 }}>Nom de l'équipe *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Team Cra..."
            style={{ ...selectStyle }}
          />
        </div>
        <div style={{ width: 100 }}>
          <label style={{ color: '#8b949e', fontSize: '0.72rem', display: 'block', marginBottom: 3 }}>Patch</label>
          <select value={patch} onChange={e => setPatch(e.target.value)} style={selectStyle}>
            {AVAILABLE_PATCHES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Roles */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.4rem' }}>COMPOSITION (4 rôles)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {ROLE_ORDER.map(role => (
            <div key={role}>
              <label style={{ color: '#8b949e', fontSize: '0.7rem', display: 'block', marginBottom: 2 }}>{ROLE_LABELS_SHORT[role]}</label>
              <select
                value={roles[role] ?? ''}
                onChange={e => setRoles(prev => ({ ...prev, [role]: e.target.value || null }))}
                style={selectStyle}
              >
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

      {/* Comment */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.4rem' }}>COMMENTAIRE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <textarea
            value={comment.description}
            onChange={e => setComment(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description de la composition..."
            style={textareaStyle}
          />
          <textarea
            value={comment.strengths}
            onChange={e => setComment(prev => ({ ...prev, strengths: e.target.value }))}
            placeholder="Points forts..."
            style={{ ...textareaStyle, minHeight: 48 }}
          />
          <textarea
            value={comment.weaknesses}
            onChange={e => setComment(prev => ({ ...prev, weaknesses: e.target.value }))}
            placeholder="Points faibles..."
            style={{ ...textareaStyle, minHeight: 48 }}
          />
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

function RecommendedTeamsSection({ classes, adminPassword, onRefresh }: {
  classes: DofusClass[];
  adminPassword: string;
  onRefresh: () => void;
}) {
  const { teams } = useTeams();
  const recommended = teams.filter(t => t.isRecommended === true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette équipe recommandée ?')) return;
    setDeleting(id);
    try {
      await apiDeleteRecommendedTeam(id, adminPassword);
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingId(null);
    onRefresh();
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🏆 Équipes Recommandées</div>
          <div style={{ color: '#8b949e', fontSize: '0.78rem' }}>{recommended.length} équipe{recommended.length > 1 ? 's' : ''} — visibles dans la Tier List</div>
        </div>
        {!showForm && !editingId && (
          <button onClick={() => setShowForm(true)} className="dofus-btn" style={{ fontSize: '0.8rem' }}>
            + Nouvelle équipe
          </button>
        )}
      </div>

      {/* New team form */}
      {showForm && (
        <div className="dofus-card" style={{ padding: '1rem', marginBottom: '0.75rem', border: '1px solid rgba(212,160,23,0.3)' }}>
          <div style={{ color: '#d4a017', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem' }}>Nouvelle équipe recommandée</div>
          <RecommendedTeamForm
            classes={classes}
            adminPassword={adminPassword}
            onSave={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Existing teams list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {recommended.map(team => (
          <div key={team.id} className="dofus-card" style={{ padding: '0.75rem 1rem', border: '1px solid #30363d' }}>
            {editingId === team.id ? (
              <>
                <div style={{ color: '#d4a017', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.88rem' }}>Modifier : {team.name}</div>
                <RecommendedTeamForm
                  classes={classes}
                  adminPassword={adminPassword}
                  initial={{
                    id: team.id,
                    name: team.name ?? '',
                    patch: team.patch,
                    roles: team.roles,
                    comment: team.comment,
                  }}
                  onSave={handleSaved}
                  onCancel={() => setEditingId(null)}
                />
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
                  <span style={{ color: '#8b949e', fontSize: '0.72rem', marginLeft: '0.5rem' }}>patch {team.patch} — {(team.autoScore / 2).toFixed(1)} ★ / 5</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setEditingId(team.id)}
                    className="dofus-btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    disabled={deleting === team.id}
                    style={{
                      background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
                      color: '#ff6b6b', borderRadius: 6, padding: '0.3rem 0.7rem',
                      fontSize: '0.75rem', cursor: 'pointer',
                    }}
                  >
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

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export function AdminPage() {
  const { classes, setClasses, loading } = useClasses();
  const { refresh } = useTeams();
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminPassword, setAdminPwd] = useState('');
  const [saved, setSaved] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'classes' | 'recommended'>('recommended');

  if (!loggedIn) return <AdminLogin onLogin={pwd => { setLoggedIn(true); setAdminPwd(pwd); }} />;
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement...</div>;

  const handleClassChange = async (updated: DofusClass) => {
    const next = classes.map(c => c.id === updated.id ? updated : c);
    setClasses(next);
    setSaved(false);
    await saveClassesToStorage(next, adminPassword);
  };

  const handleSave = async () => {
    await saveClassesToStorage(classes, adminPassword);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePwd = async () => {
    if (newPwd.length < 4) { setPwdMsg('Mot de passe trop court (min. 4 caractères)'); return; }
    await setAdminPassword(adminPassword, newPwd);
    setAdminPwd(newPwd);
    setPwdMsg('Mot de passe mis à jour !');
    setNewPwd('');
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
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Gérez les classes et les équipes recommandées.</p>
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
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button style={tabStyle(activeTab === 'recommended')} onClick={() => setActiveTab('recommended')}>
          🏆 Équipes recommandées
        </button>
        <button style={tabStyle(activeTab === 'classes')} onClick={() => setActiveTab('classes')}>
          ⚔️ Classes
        </button>
      </div>

      {/* Tab: Recommended Teams */}
      {activeTab === 'recommended' && (
        <RecommendedTeamsSection classes={classes} adminPassword={adminPassword} onRefresh={refresh} />
      )}

      {/* Tab: Classes */}
      {activeTab === 'classes' && (
        <>
          <div style={{
            background: 'rgba(77,166,255,0.08)', border: '1px solid rgba(77,166,255,0.25)',
            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#4da6ff',
          }}>
            ℹ️ <strong>Déployer les changements :</strong> Cliquez sur "Exporter JSON", puis remplacez{' '}
            <code>public/data/classes.json</code> dans votre dépôt GitHub et commitez.
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 Rechercher une classe..."
            style={{
              width: '100%', background: '#1c2128', border: '1px solid #30363d', borderRadius: 8,
              color: '#e6edf3', padding: '0.65rem 0.9rem', fontSize: '0.9rem', outline: 'none',
              marginBottom: '1rem', boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {filtered.map(cls => (
              <ClassEditor key={cls.id} cls={cls} allClasses={classes} onChange={handleClassChange} />
            ))}
          </div>
        </>
      )}

      {/* Change password */}
      <div className="dofus-card" style={{ padding: '1rem' }}>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>CHANGER LE MOT DE PASSE ADMIN</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            placeholder="Nouveau mot de passe"
            style={{
              flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
              color: '#e6edf3', padding: '0.6rem 0.8rem', fontSize: '0.85rem', outline: 'none',
            }}
          />
          <button onClick={handleChangePwd} className="dofus-btn-outline">Changer</button>
        </div>
        {pwdMsg && <div style={{ color: pwdMsg.includes('!') ? '#1dd1a1' : '#ff6b6b', fontSize: '0.75rem', marginTop: 6 }}>{pwdMsg}</div>}
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button onClick={() => setLoggedIn(false)} style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.8rem' }}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
