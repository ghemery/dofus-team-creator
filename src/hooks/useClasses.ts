import { useState, useEffect } from 'react';
import type { DofusClass } from '../types';
import { loadClasses, getClassesOverride } from '../lib/storage';

export function useClasses() {
  const [classes, setClasses] = useState<DofusClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prefer admin override if set
    const override = getClassesOverride();
    if (override) {
      setClasses(override);
      setLoading(false);
      return;
    }

    loadClasses()
      .then(data => {
        setClasses(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { classes, setClasses, loading, error };
}
