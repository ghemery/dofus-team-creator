import { useState, useEffect } from 'react';
import { ClassStats, CURRENT_PATCH } from '../types';
import { loadClassCommunityStats } from '../lib/storage';

interface CommunityStatsResult {
  averages: Record<string, ClassStats>;
  counts: Record<string, number>;
  loading: boolean;
}

export function useCommunityStats(patch: string = CURRENT_PATCH): CommunityStatsResult {
  const [averages, setAverages] = useState<Record<string, ClassStats>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadClassCommunityStats(patch)
      .then(({ averages, counts }) => {
        setAverages(averages);
        setCounts(counts);
      })
      .finally(() => setLoading(false));
  }, [patch]);

  return { averages, counts, loading };
}
