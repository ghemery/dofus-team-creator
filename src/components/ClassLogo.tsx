import { useState } from 'react';
import { DofusClass } from '../types';

interface ClassLogoProps {
  dofusClass: DofusClass;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
  showName?: boolean;
  disabled?: boolean;
}

export function ClassLogo({
  dofusClass,
  size = 72,
  selected = false,
  onClick,
  showName = false,
  disabled = false,
}: ClassLogoProps) {
  const [imgError, setImgError] = useState(false);

  const initials = dofusClass.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  const showImage = dofusClass.logoUrl && !imgError;

  return (
    <div
      onClick={disabled ? undefined : onClick}
      title={dofusClass.name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: selected
            ? `radial-gradient(circle, ${dofusClass.color}55 0%, ${dofusClass.color}22 100%)`
            : `radial-gradient(circle, #2a2a3a 0%, #1a1a2a 100%)`,
          border: selected
            ? `3px solid ${dofusClass.color}`
            : '2px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: selected ? `0 0 16px ${dofusClass.color}66` : 'none',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {showImage ? (
          <img
            src={dofusClass.logoUrl}
            alt={dofusClass.name}
            style={{ width: '85%', height: '85%', objectFit: 'cover', borderRadius: '50%' }}
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
          />
        ) : (
          <span
            style={{
              color: dofusClass.color,
              fontWeight: 800,
              fontSize: size * 0.28,
              fontFamily: 'monospace',
              userSelect: 'none',
            }}
          >
            {initials}
          </span>
        )}
      </div>
      {showName && (
        <span
          style={{
            fontSize: '0.7rem',
            color: selected ? dofusClass.color : '#8b949e',
            fontWeight: selected ? 700 : 400,
            textAlign: 'center',
            maxWidth: size,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {dofusClass.name}
        </span>
      )}
    </div>
  );
}
