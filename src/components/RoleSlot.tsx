import { useState } from 'react';
import { DofusClass, RoleType, ROLE_LABELS, ROLE_COLORS } from '../types';
import { ClassLogo } from './ClassLogo';
import { ClassGrid } from './ClassGrid';

interface RoleSlotProps {
  role: RoleType;
  selectedClassId: string | null;
  classes: DofusClass[];
  onSelect: (classId: string | null) => void;
}

export function RoleSlot({ role, selectedClassId, classes, onSelect }: RoleSlotProps) {
  const [open, setOpen] = useState(false);
  const selectedClass = classes.find(c => c.id === selectedClassId) ?? null;
  const roleColor = ROLE_COLORS[role];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Role header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: roleColor }} />
        <span style={{ color: roleColor, fontWeight: 700, fontSize: '0.9rem' }}>
          {ROLE_LABELS[role]}
        </span>
      </div>

      {/* Selected class slot */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: '#1c2128',
          border: `2px solid ${open ? roleColor : '#30363d'}`,
          borderRadius: 12,
          padding: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minHeight: 80,
        }}
      >
        {selectedClass ? (
          <>
            <ClassLogo dofusClass={selectedClass} size={52} selected />
            <div style={{ flex: 1 }}>
              <div style={{ color: selectedClass.color, fontWeight: 700 }}>
                {selectedClass.name}
              </div>
              <div style={{ color: '#8b949e', fontSize: '0.75rem', marginTop: 2 }}>
                Cliquer pour changer
              </div>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                onSelect(null);
                setOpen(false);
              }}
              style={{
                background: 'rgba(255,100,100,0.15)',
                border: '1px solid rgba(255,100,100,0.3)',
                borderRadius: 6,
                color: '#ff6b6b',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              ✕
            </button>
          </>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', color: '#8b949e' }}>
            <div style={{ fontSize: '2rem', marginBottom: 4 }}>+</div>
            <div style={{ fontSize: '0.8rem' }}>Choisir une classe</div>
          </div>
        )}
      </div>

      {/* Class picker dropdown */}
      {open && (
        <div
          style={{
            background: '#1c2128',
            border: `1px solid ${roleColor}44`,
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          <div style={{ padding: '0.75rem 0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>Sélectionner une classe</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b949e',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0 0.25rem',
              }}
            >
              ✕
            </button>
          </div>
          <ClassGrid
            classes={classes}
            selectedId={selectedClassId}
            onSelect={id => {
              onSelect(id);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
