import { PreferredRole, PREFERRED_ROLE_EMOJI } from '../types';

interface RoleBadgesProps {
  roles: PreferredRole[];
  containerSize: number;
}

// Badge positions: up to 4 badges placed around the circle edge
const BADGE_POSITIONS = [
  { top: -4, right: -4 },   // top-right
  { bottom: -4, right: -4 }, // bottom-right
  { top: -4, left: -4 },    // top-left
  { bottom: -4, left: -4 }, // bottom-left
];

export function RoleBadges({ roles, containerSize }: RoleBadgesProps) {
  if (!roles || roles.length === 0) return null;

  const badgeSize = Math.max(14, Math.round(containerSize * 0.28));
  const fontSize = Math.max(8, Math.round(badgeSize * 0.65));

  return (
    <>
      {roles.slice(0, 4).map((role, i) => {
        const pos = BADGE_POSITIONS[i];
        return (
          <div
            key={role}
            title={role}
            style={{
              position: 'absolute',
              ...pos,
              width: badgeSize,
              height: badgeSize,
              borderRadius: '50%',
              background: '#1c2128',
              border: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize,
              lineHeight: 1,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            {PREFERRED_ROLE_EMOJI[role]}
          </div>
        );
      })}
    </>
  );
}
