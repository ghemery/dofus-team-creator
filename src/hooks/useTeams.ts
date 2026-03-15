import { useState, useCallback, useEffect } from 'react';
import { SavedTeam, TeamRoles, TeamComment, CURRENT_PATCH, EMPTY_COMMENT } from '../types';
import { loadTeams, saveTeam, rateTeam, deleteTeam, hasRated, migrateLocalStorageTeams } from '../lib/storage';

export function useTeams() {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    migrateLocalStorageTeams().then(() => loadTeams()).then(data => {
      setTeams(data);
      setInitialized(true);
    });
  }, []);

  const refresh = useCallback(async () => {
    const data = await loadTeams();
    setTeams(data);
  }, []);

  const addTeam = useCallback(async (
    roles: TeamRoles,
    autoScore: number,
    patch: string = CURRENT_PATCH,
    comment: TeamComment = EMPTY_COMMENT,
    name?: string,
  ) => {
    const team = await saveTeam(roles, autoScore, patch, comment, name);
    setTeams(prev => [...prev, team]);
    return team;
  }, []);

  const submitRating = useCallback(async (teamId: string, rating: number) => {
    await rateTeam(teamId, rating);
    await refresh();
  }, [refresh]);

  const removeTeam = useCallback(async (teamId: string) => {
    await deleteTeam(teamId);
    setTeams(prev => prev.filter(t => t.id !== teamId));
  }, []);

  return { teams, addTeam, submitRating, removeTeam, hasRated, refresh, initialized };
}
