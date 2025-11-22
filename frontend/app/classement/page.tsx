'use client';

import { useEffect, useState } from 'react';
import NavigationBar from '@/components/NavigationBar';
import { api } from '@/lib/api';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';

interface TeamScore {
  id: string;
  name: string;
  currentScore: number;
  rank: number | null;
  roomNumber: number | null;
}

export default function ClassementPage() {
  const [teams, setTeams] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charger immédiatement
    fetchLeaderboard();

    // Auto-refresh toutes les 10 secondes
    const interval = setInterval(fetchLeaderboard, 10000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/public/leaderboard');
      if (response.data.success) {
        setTeams(response.data.data.teams || []);
      } else {
        setError('Erreur lors du chargement du classement');
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError('Impossible de charger le classement. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number | null) => {
    if (rank === null) return null;
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankColor = (rank: number | null) => {
    if (rank === null) return 'text-gray-400';
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-white';
  };

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      <NavigationBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-rose to-sky-aqua">
                Classement
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Découvrez les équipes en tête du classement
            </p>
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neon-rose" />
            </div>
          ) : error ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="px-6 py-2 bg-neon-rose hover:bg-neon-rose/90 text-white font-bold rounded-xl transition-all"
              >
                Réessayer
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-gray-400">Aucune équipe dans le classement pour le moment.</p>
            </div>
          ) : (
            <div className="glass-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                        Rang
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                        Équipe
                      </th>
                      <th className="text-right py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                        Salle
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr
                        key={team.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {getRankIcon(team.rank || index + 1)}
                            <span className={`font-bold text-lg ${getRankColor(team.rank || index + 1)}`}>
                              {team.rank || index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-white">{team.name}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-bold text-sky-aqua text-lg">
                            {team.currentScore || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {team.roomNumber ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-midnight-blue text-sky-aqua border border-sky-aqua/30">
                              Salle {team.roomNumber}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

