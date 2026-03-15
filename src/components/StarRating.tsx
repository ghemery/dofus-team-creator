import { useState } from 'react';

interface StarRatingProps {
  value: number | null;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
  showValue?: boolean;
  allowHalf?: boolean;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
  showValue = true,
  allowHalf = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = 5;
  const displayValue = hovered ?? value ?? 0;

  const getHalfValue = (n: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientX - rect.left < rect.width / 2 ? n - 0.5 : n;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        style={{ display: 'flex', gap: 2 }}
        onMouseLeave={() => !readonly && setHovered(null)}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map(n => {
          if (allowHalf) {
            const fillPercent = Math.min(100, Math.max(0, (displayValue - (n - 1)) * 100));
            return (
              <div
                key={n}
                onClick={e => !readonly && onChange?.(getHalfValue(n, e))}
                onMouseMove={e => !readonly && setHovered(getHalfValue(n, e))}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: size,
                  height: size,
                  cursor: readonly ? 'default' : 'pointer',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#30363d', fontSize: size, lineHeight: 1, position: 'absolute', left: 0, top: 0 }}>★</span>
                <span style={{
                  color: '#d4a017',
                  fontSize: size,
                  lineHeight: 1,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  overflow: 'hidden',
                  width: `${fillPercent}%`,
                  whiteSpace: 'nowrap',
                }}>★</span>
              </div>
            );
          } else {
            const filled = n <= displayValue;
            return (
              <span
                key={n}
                onClick={() => !readonly && onChange?.(n)}
                onMouseEnter={() => !readonly && setHovered(n)}
                style={{
                  fontSize: size,
                  cursor: readonly ? 'default' : 'pointer',
                  color: filled ? '#d4a017' : '#30363d',
                  transition: 'color 0.1s',
                  userSelect: 'none',
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            );
          }
        })}
      </div>
      {showValue && value !== null && (
        <span style={{ color: '#d4a017', fontWeight: 700, fontSize: '0.85rem' }}>
          {value}/5
        </span>
      )}
    </div>
  );
}
