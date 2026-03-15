import { useState, useEffect } from 'react';
import { useClasses } from '../hooks/useClasses';
import { loadClassCommunityStats } from '../lib/storage';
import { computePerfectRole } from '../lib/scoring';
import { ClassStats, ROLE_LABELS_SHORT, ROLE_COLORS } from '../types';
import { ClassLogo } from '../components/ClassLogo';
import { ClassRatingModal } from '../components/ClassRatingModal';

export function ClassesPage() {
  const { classes, loading } = useClasses();
  const [communityAverages, setCommunityAverages] = useState<Record<string, ClassStats>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStats = async () => {
    const { averages, counts } = await loadClassCommunityStats();
    setCommunityAverages(averages);
    setVoteCounts(counts);
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#8b949e' }}>Chargement...</div>;
  }

  const filtered = searchQuery
    ? classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : classes;

  const selectedClass = selectedClassId ? classes.find(c => c.id === selectedClassId) ?? null : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#d4a017', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>🎭 Classes</h1>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
            Notez chaque classe selon votre expérience — la moyenne communautaire détermine son rôle parfait.
          </p>
        </div>
        <input
          type="text"
          placeholder="Rechercher une classe..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
            color: '#e6edf3', padding: '0.5rem 0.9rem', fontSize: '0.85rem',
            outline: 'none', width: 220,
          }}
        />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.75rem',
      }}>
        {filtered.map(cls => {
          const communityStats = communityAverages[cls.id] ?? null;
          const statsForRole = communityStats ?? cls.stats;
          const perfectRole = computePerfectRole(statsForRole);
          const roleColor = ROLE_COLORS[perfectRole];
          const count = voteCounts[cls.id] ?? 0;

          return (
            <div
              key={cls.id}
              className="dofus-card"
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                border: `1px solid #30363d`,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = cls.color + '88';
                e.currentTarget.style.background = cls.color + '08';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#30363d';
                e.currentTarget.style.background = '';
              }}
              onClick={() => setSelectedClassId(cls.id)}
            >
              <ClassLogo dofusClass={cls} size={56} />
              <div style={{ color: cls.color, fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
                {cls.name}
              </div>

              {/* Perfect role badge */}
              <div style={{
                background: `${roleColor}18`,
                border: `1px solid ${roleColor}55`,
                color: roleColor,
                borderRadius: 6,
                padding: '2px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textAlign: 'center',
              }}>
                {ROLE_LABELS_SHORT[perfectRole]}
              </div>

              {/* Vote count */}
              <div style={{ color: '#8b949e', fontSize: '0.68rem' }}>
                {count > 0 ? `${count} vote${count > 1 ? 's' : ''}` : 'Aucun vote'}
                {count === 0 && communityStats === null && (
                  <span style={{ color: '#444c56' }}> — stats officielles</span>
                )}
              </div>

              {/* Rate button */}
              <button
                className="dofus-btn"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', marginTop: 2 }}
                onClick={e => { e.stopPropagation(); setSelectedClassId(cls.id); }}
              >
                ⭐ Noter
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8b949e' }}>
          Aucune classe trouvée pour « {searchQuery} »
        </div>
      )}

      {/* Modal */}
      {selectedClass && (
        <ClassRatingModal
          cls={selectedClass}
          communityStats={communityAverages[selectedClass.id] ?? null}
          voteCount={voteCounts[selectedClass.id] ?? 0}
          onClose={() => setSelectedClassId(null)}
          onVoted={() => loadStats()}
        />
      )}
    </div>
  );
}
