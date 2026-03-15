import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') ?? '/';

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    color: '#e6edf3',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const btnPrimary = {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #f0c040, #e8a020)',
    border: 'none',
    borderRadius: 8,
    color: '#1a1a2a',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: 16,
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2rem' }}>⚔️</span>
          <h1 style={{ color: '#f0c040', margin: '0.5rem 0 0', fontSize: '1.4rem', fontWeight: 800 }}>
            Dofus Team Creator
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#0d1117', borderRadius: 8, padding: 4 }}>
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: tab === t ? '#21262d' : 'transparent',
                border: 'none',
                borderRadius: 6,
                color: tab === t ? '#e6edf3' : '#8b949e',
                fontWeight: tab === t ? 700 : 400,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {t === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', color: '#8b949e', fontSize: '0.85rem', marginBottom: 4 }}>Pseudo</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Votre pseudo"
                required
                style={inputStyle}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', color: '#8b949e', fontSize: '0.85rem', marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#8b949e', fontSize: '0.85rem', marginBottom: 4 }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'Au moins 6 caractères' : '••••••••'}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,100,100,0.1)',
              border: '1px solid rgba(255,100,100,0.3)',
              borderRadius: 8,
              padding: '0.75rem',
              color: '#ff6b6b',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to={redirect}
            style={{ color: '#8b949e', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            Continuer sans compte →
          </Link>
        </div>
      </div>
    </div>
  );
}
