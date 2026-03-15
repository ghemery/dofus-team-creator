import { ClassStats, STAT_LABELS, STAT_ICONS } from '../types';

interface StatSliderProps {
  statKey: keyof ClassStats;
  value: number;
  onChange: (v: number) => void;
  readonly?: boolean;
}

export function StatSlider({ statKey, value, onChange, readonly = false }: StatSliderProps) {
  const label = STAT_LABELS[statKey];
  const icon = STAT_ICONS[statKey];
  const color = value >= 7 ? '#d4a017' : value >= 4 ? '#4da6ff' : '#8b949e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{icon} {label}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={e => !readonly && onChange(Number(e.target.value))}
        disabled={readonly}
        style={{ width: '100%', accentColor: color, cursor: readonly ? 'default' : 'pointer' }}
      />
    </div>
  );
}
