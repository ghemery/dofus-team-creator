import { useState, useCallback, useEffect } from 'react';
import { SavedTeam, TeamRoles, TeamComment, CURRENT_PATCH, EMPTY_COMMENT } from '../types';
import { loadTeams, saveTeam, rateTeam, deleteTeam, hasRated, initDefaultTeams } from '../lib/storage';

export function useTeams() {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initDefaultTeams().then(() => {
      setTeams(loadTeams());
      setInitialized(true);
    });
  }, []);

  const refresh = useCallback(() => {
    setTeams(loadTeams());
  }, []);

  const addTeam = useCallback((
    roles: TeamRoles,
    autoScore: number,
    patch: string = CURRENT_PATCH,
    comment: TeamComment = EMPTY_COMMENT,
    name?: string,
  ) => {
    const team = saveTeam(roles, autoScore, patch, comment, name);
    setTeams(prev => [...prev, team]);
    return team;
  }, []);

  const submitRating = useCallback((teamId: string, rating: number) => {
    rateTeam(teamId, rating);
    refresh();
  }, [refresh]);

  const removeTeam = useCallback((teamId: string) => {
    deleteTeam(teamId);
    setTeams(prev => prev.filter(t => t.id !== teamId));
  }, []);

  return { teams, addTeam, submitRating, removeTeam, hasRated, refresh, initialized };
}
