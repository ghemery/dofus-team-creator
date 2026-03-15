import { getTier } from '../types';
import { StarRating } from './StarRating';

interface ScoreBarProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const tierColors: Record<string, string> = {
  S: '#ff4d4d',
  A: '#ff9900',
  B: '#4da6ff',
  C: '#8b949e',
};

export function ScoreBar({ score, label, size = 'md' }: ScoreBarProps) {
  const tier = getTier(score);
  const color = tierColors[tier];
  const pct = (score / 10) * 100;

  const heights = { sm: 6, md: 10, lg: 14 };
  const h = heights[size];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRating value={Math.round(score / 2)} readonly size={14} showValue={false} />
            <span
              style={{
                background: `${color}22`,
                border: `1px solid ${color}`,
                color,
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              {tier}
            </span>
          </div>
        </div>
      )}
      <div
        style={{
          height: h,
          background: '#30363d',
          borderRadius: h / 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: h / 2,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}

interface StatRadarProps {
  stats: Record<string, number>;
  labels: Record<string, string>;
  icons?: Record<string, string>;
  qualitativeKeys?: Record<string, (v: number) => { label: string; color: string }>;
}

export function StatGrid({ stats, labels, icons, qualitativeKeys }: StatRadarProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
      {Object.entries(stats).map(([key, value]) => {
        const qualFn = qualitativeKeys?.[key];
        if (qualFn) {
          const { label, color } = qualFn(value);
          return (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
              <span style={{ color: '#8b949e', fontSize: '0.7rem' }}>{icons?.[key]} {labels[key]}</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color,
                background: `${color}18`,
                border: `1px solid ${color}44`,
                borderRadius: 4,
                padding: '1px 5px',
              }}>{label}</span>
            </div>
          );
        }
        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e', fontSize: '0.7rem' }}>{icons?.[key]} {labels[key]}</span>
              <span style={{ color: '#e6edf3', fontSize: '0.7rem', fontWeight: 600 }}>{value}</span>
            </div>
            <div style={{ height: 4, background: '#30363d', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${value * 10}%`,
                background: value >= 7 ? '#d4a017' : value >= 4 ? '#4da6ff' : '#30363d',
                borderRadius: 2,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
