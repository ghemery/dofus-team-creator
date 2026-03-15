import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '2rem', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem' }}>⚔️</span>
          <span style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.1rem', letterSpacing: 1 }}>
            Dofus Team Builder
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto', alignItems: 'center' }}>
          {[
            { to: '/', label: '🛠️ Builder' },
            { to: '/tierlist', label: '🏆 Tier List' },
            { to: '/classement', label: '📊 Classement' },
            { to: '/classes', label: '🎭 Classes' },
            { to: '/admin', label: '⚙️ Admin' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                padding: '0.4rem 0.9rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#d4a017' : '#8b949e',
                background: isActive ? 'rgba(212, 160, 23, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(212, 160, 23, 0.3)' : '1px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              {label}
            </NavLink>
          ))}

          <div style={{ width: 1, height: 24, background: '#30363d', margin: '0 0.5rem' }} />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#e6edf3', fontSize: '0.85rem', fontWeight: 600 }}>
                {user.role === 'admin' && <span style={{ color: '#f0c040', marginRight: 4 }}>★</span>}
                {user.username}
              </span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#8b949e',
                  padding: '0.3rem 0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              style={({ isActive }) => ({
                padding: '0.4rem 0.9rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: isActive ? '#d4a017' : '#8b949e',
                background: isActive ? 'rgba(212, 160, 23, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(212, 160, 23, 0.3)' : '1px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              🔑 Connexion
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
