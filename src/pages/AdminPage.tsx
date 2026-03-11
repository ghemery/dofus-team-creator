import { useState } from 'react';
import { DofusClass, ClassStats, STAT_LABELS, STAT_ICONS } from '../types';
import { useClasses } from '../hooks/useClasses';
import { saveClassesToStorage, exportClassesJson, checkAdminPassword, setAdminPassword } from '../lib/storage';
import { ClassLogo } from '../components/ClassLogo';

// ─── Admin login ─────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(pwd)) {
      onLogin();
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '6rem auto', padding: '0 1rem' }}>
      <div className="dofus-card" style={{ padding: '2rem' }}>
        <h2 style={{ color: '#d4a017', textAlign: 'center', margin: '0 0 1.5rem' }}>
          ⚙️ Administration
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: '#8b949e', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>
              Mot de passe admin
            </label>
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="Entrez le mot de passe"
              autoFocus
              style={{
                width: '100%',
                background: '#161b22',
                border: `1px solid ${error ? '#ff6b6b' : '#30363d'}`,
                borderRadius: 8,
                color: '#e6edf3',
                padding: '0.7rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: 4 }}>{error}</div>}
          </div>
          <button type="submit" className="dofus-btn" style={{ width: '100%' }}>
            Se connecter
          </button>
        </form>
        <div style={{ marginTop: '1rem', color: '#8b949e', fontSize: '0.72rem', textAlign: 'center' }}>
          Mot de passe par défaut : <code style={{ color: '#d4a017' }}>admin1234</code>
        </div>
      </div>
    </div>
  );
}

// ─── Stat slider ─────────────────────────────────────────────────────────────

function StatSlider({
  statKey,
  value,
  onChange,
}: {
  statKey: keyof ClassStats;
  value: number;
  onChange: (v: number) => void;
}) {
  const label = STAT_LABELS[statKey];
  const icon = STAT_ICONS[statKey];
  const color = value >= 7 ? '#d4a017' : value >= 4 ? '#4da6ff' : '#8b949e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
      />
    </div>
  );
}

// ─── Class editor ─────────────────────────────────────────────────────────────

function ClassEditor({
  cls,
  allClasses,
  onChange,
}: {
  cls: DofusClass;
  allClasses: DofusClass[];
  onChange: (updated: DofusClass) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const updateStat = (stat: keyof ClassStats, val: number) => {
    onChange({ ...cls, stats: { ...cls.stats, [stat]: val } });
  };

  const toggleIncompat = (otherId: string) => {
    const already = cls.incompatibleWith.includes(otherId);
    onChange({
      ...cls,
      incompatibleWith: already
        ? cls.incompatibleWith.filter(id => id !== otherId)
        : [...cls.incompatibleWith, otherId],
    });
  };

  const updateLogoUrl = (url: string) => {
    onChange({ ...cls, logoUrl: url });
  };

  return (
    <div
      className="dofus-card"
      style={{
        overflow: 'hidden',
        border: expanded ? `1px solid ${cls.color}55` : '1px solid #30363d',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          background: expanded ? `${cls.color}0d` : 'transparent',
        }}
      >
        <ClassLogo dofusClass={cls} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ color: cls.color, fontWeight: 700 }}>{cls.name}</div>
          {cls.incompatibleWith.length > 0 && (
            <div style={{ color: '#ff6b6b', fontSize: '0.7rem' }}>
              ⚠️ Incompatible avec {cls.incompatibleWith.length} classe(s)
            </div>
          )}
        </div>
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '1rem', borderTop: `1px solid ${cls.color}33` }}>
          {/* Logo URL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#8b949e', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
              URL du logo (laisser vide pour l'avatar généré)
            </label>
            <input
              type="text"
              value={cls.logoUrl}
              onChange={e => updateLogoUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 6,
                color: '#e6edf3',
                padding: '0.5rem 0.7rem',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              STATISTIQUES (0–10)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {(Object.keys(cls.stats) as (keyof ClassStats)[]).map(stat => (
                <StatSlider
                  key={stat}
                  statKey={stat}
                  value={cls.stats[stat]}
                  onChange={val => updateStat(stat, val)}
                />
              ))}
            </div>
          </div>

          {/* Incompatibilities */}
          <div>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              DÉCONSEILLÉ AVEC
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {allClasses
                .filter(c => c.id !== cls.id)
                .map(other => {
                  const active = cls.incompatibleWith.includes(other.id);
                  return (
                    <button
                      key={other.id}
                      onClick={() => toggleIncompat(other.id)}
                      style={{
                        background: active ? `${other.color}22` : '#161b22',
                        border: `1px solid ${active ? other.color : '#30363d'}`,
                        borderRadius: 6,
                        color: active ? other.color : '#8b949e',
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: active ? 700 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
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

// ─── Admin page ───────────────────────────────────────────────────────────────

export function AdminPage() {
  const { classes, setClasses, loading } = useClasses();
  const [loggedIn, setLoggedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>
      Chargement...
    </div>
  );

  const handleClassChange = (updated: DofusClass) => {
    const next = classes.map(c => c.id === updated.id ? updated : c);
    setClasses(next);
    saveClassesToStorage(next);
    setSaved(false);
  };

  const handleSave = () => {
    saveClassesToStorage(classes);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = () => {
    exportClassesJson(classes);
  };

  const handleChangePwd = () => {
    if (newPwd.length < 4) {
      setPwdMsg('Mot de passe trop court (min. 4 caractères)');
      return;
    }
    setAdminPassword(newPwd);
    setPwdMsg('Mot de passe mis à jour !');
    setNewPwd('');
    setTimeout(() => setPwdMsg(''), 3000);
  };

  const filtered = searchQuery
    ? classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : classes;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
            ⚙️ Administration
          </h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Configurez les statistiques et incompatibilités de chaque classe.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {saved && (
            <span style={{ color: '#1dd1a1', fontSize: '0.85rem', alignSelf: 'center' }}>
              ✓ Sauvegardé
            </span>
          )}
          <button onClick={handleSave} className="dofus-btn-outline">
            💾 Sauvegarder (session)
          </button>
          <button onClick={handleExport} className="dofus-btn">
            ⬇️ Exporter JSON
          </button>
        </div>
      </div>

      {/* Export info banner */}
      <div
        style={{
          background: 'rgba(77, 166, 255, 0.08)',
          border: '1px solid rgba(77, 166, 255, 0.25)',
          borderRadius: 10,
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.8rem',
          color: '#4da6ff',
        }}
      >
        ℹ️ <strong>Comment déployer les changements :</strong> Cliquez sur "Exporter JSON",
        puis remplacez <code>public/data/classes.json</code> dans votre dépôt GitHub.
        Les modifications seront en ligne après le prochain déploiement.
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="🔍 Rechercher une classe..."
        style={{
          width: '100%',
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: 8,
          color: '#e6edf3',
          padding: '0.65rem 0.9rem',
          fontSize: '0.9rem',
          outline: 'none',
          marginBottom: '1rem',
          boxSizing: 'border-box',
        }}
      />

      {/* Class list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        {filtered.map(cls => (
          <ClassEditor
            key={cls.id}
            cls={cls}
            allClasses={classes}
            onChange={handleClassChange}
          />
        ))}
      </div>

      {/* Change password */}
      <div className="dofus-card" style={{ padding: '1rem' }}>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          CHANGER LE MOT DE PASSE ADMIN
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            placeholder="Nouveau mot de passe"
            style={{
              flex: 1,
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              color: '#e6edf3',
              padding: '0.6rem 0.8rem',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button onClick={handleChangePwd} className="dofus-btn-outline">
            Changer
          </button>
        </div>
        {pwdMsg && (
          <div style={{ color: pwdMsg.includes('!') ? '#1dd1a1' : '#ff6b6b', fontSize: '0.75rem', marginTop: 6 }}>
            {pwdMsg}
          </div>
        )}
      </div>

      {/* Logout */}
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          onClick={() => setLoggedIn(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
