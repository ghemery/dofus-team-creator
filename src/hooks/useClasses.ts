import { useState, useEffect } from 'react';
import type { DofusClass } from '../types';
import { loadClasses } from '../lib/storage';

export function useClasses() {
  const [classes, setClasses] = useState<DofusClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
