import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <nav style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '2rem', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem' }}>⚔️</span>
          <span style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.1rem', letterSpacing: 1 }}>
            Dofus Team Builder
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
          {[
            { to: '/', label: '🛠️ Builder' },
            { to: '/suggestions', label: '💡 Suggestions' },
            { to: '/tierlist', label: '🏆 Tier List' },
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
        </div>
      </div>
    </nav>
  );
}
