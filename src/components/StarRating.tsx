import { useState } from 'react';

interface StarRatingProps {
  value: number | null;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
  showValue?: boolean;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
  showValue = true,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = 10;
  const displayValue = hovered ?? value ?? 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => {
          const filled = n <= displayValue;
          return (
            <span
              key={n}
              onClick={() => !readonly && onChange?.(n)}
              onMouseEnter={() => !readonly && setHovered(n)}
              onMouseLeave={() => !readonly && setHovered(null)}
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
        })}
      </div>
      {showValue && value !== null && (
        <span style={{ color: '#d4a017', fontWeight: 700, fontSize: '0.85rem' }}>
          {value}/10
        </span>
      )}
    </div>
  );
}
