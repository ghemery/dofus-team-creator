import { useState, useCallback } from 'react';
import { SavedTeam, TeamRoles } from '../types';
import { loadTeams, saveTeam, rateTeam, deleteTeam, hasRated } from '../lib/storage';

export function useTeams() {
  const [teams, setTeams] = useState<SavedTeam[]>(() => loadTeams());

  const refresh = useCallback(() => {
    setTeams(loadTeams());
  }, []);

  const addTeam = useCallback((roles: TeamRoles, autoScore: number, name?: string) => {
    const team = saveTeam(roles, autoScore, name);
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

  return { teams, addTeam, submitRating, removeTeam, hasRated, refresh };
}
