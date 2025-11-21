import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Stats {
  overview: {
    totalRegistrations: number;
    verifiedUsers: number;
    totalTeams: number;
    completeTeams: number;
    incompleteTeams: number;
  };
  schoolDistribution: Array<{ school: string; count: number }>;
}

export interface AdminTeam {
  id: string;
  name: string;
  memberCount: number;
  isComplete: boolean;
  roomNumber: number | null;
  currentScore: number;
  rank: number | null;
}

export function useAdminData(isAdmin: boolean) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setError(null);
        const [statsRes, teamsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/teams'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (teamsRes.data.success) setTeams(teamsRes.data.data.teams);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const updateTeam = (teamId: string, updates: Partial<AdminTeam>) => {
    setTeams(teams.map(t => t.id === teamId ? { ...t, ...updates } : t));
  };

  return { stats, teams, loading, error, updateTeam, setTeams };
}

