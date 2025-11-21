import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Team } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useTeamData() {
  const { user, updateUser } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTeam = async () => {
      try {
        setError(null);
        // First, refresh user profile to get latest teamId
        try {
          const profileResponse = await api.get('/auth/profile');
          if (profileResponse.data.success && profileResponse.data.data) {
            const updatedUser = profileResponse.data.data;
            // Update user in context if teamId changed
            if (updatedUser.teamId !== user?.teamId) {
              updateUser(updatedUser);
            }
            // Use updated user data
            if (updatedUser.teamId) {
              const teamResponse = await api.get('/teams/my-team');
              if (teamResponse.data.success) {
                setTeam(teamResponse.data.data.team);
                return;
              }
            }
          }
        } catch {
          // Fallback to using existing user data
          if (user?.teamId) {
            const teamResponse = await api.get('/teams/my-team');
            if (teamResponse.data.success) {
              setTeam(teamResponse.data.data.team);
              return;
            }
          }
        }
        setTeam(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Erreur lors du chargement de l\'équipe');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user, updateUser]);

  return { team, loading, error, setTeam };
}

