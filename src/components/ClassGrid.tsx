import type { DofusClass } from '../types';
import { ClassLogo } from './ClassLogo';

interface ClassGridProps {
  classes: DofusClass[];
  selectedId: string | null;
  onSelect: (classId: string) => void;
}

export function ClassGrid({ classes, selectedId, onSelect }: ClassGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '0.75rem',
        padding: '0.75rem',
      }}
    >
      {classes.map(cls => (
        <ClassLogo
          key={cls.id}
          dofusClass={cls}
          size={68}
          selected={selectedId === cls.id}
          onClick={() => onSelect(cls.id)}
          showName
        />
      ))}
    </div>
  );
}
