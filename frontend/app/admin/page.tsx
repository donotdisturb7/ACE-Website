'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface Stats {
  overview: {
    totalRegistrations: number;
    verifiedUsers: number;
    totalTeams: number;
    completeTeams: number;
    incompleteTeams: number;
  };
  schoolDistribution: Array<{ school: string; count: number }>;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
  isComplete: boolean;
  roomNumber: number | null;
  currentScore: number;
  rank: number | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'teams' | 'rooms'>('stats');

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, teamsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/teams'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (teamsRes.data.success) setTeams(teamsRes.data.data.teams);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inscriptions-ace.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleAssignRoom = async (teamId: string, roomNumber: number) => {
    try {
      await api.post('/admin/rooms/assign', {
        assignments: [{ teamId, roomNumber }],
      });
      
      setTeams(teams.map(t => t.id === teamId ? { ...t, roomNumber } : t));
      alert('Salle assignée avec succès');
    } catch (error) {
      console.error('Error assigning room:', error);
      alert('Erreur lors de l\'assignation');
    }
  };

  const handleStartSession = async (roomNumber: number) => {
    if (!confirm(`Démarrer la session pour la salle ${roomNumber} ?`)) return;

    try {
      await api.post('/admin/sessions/start', { roomNumber });
      alert(`Session démarrée pour la salle ${roomNumber}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors du démarrage');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-lavender-mist flex items-center justify-center">
        <div className="text-midnight-blue text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-lavender-mist">
      {/* Header */}
      <nav className="bg-midnight-blue shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin - ACE 2025</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-white hover:text-sky-aqua transition"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="text-white hover:text-sky-aqua transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'stats'
                  ? 'border-neon-rose text-neon-rose'
                  : 'border-transparent text-gray-600 hover:text-midnight-blue'
              }`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'teams'
                  ? 'border-neon-rose text-neon-rose'
                  : 'border-transparent text-gray-600 hover:text-midnight-blue'
              }`}
            >
              Équipes
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === 'rooms'
                  ? 'border-neon-rose text-neon-rose'
                  : 'border-transparent text-gray-600 hover:text-midnight-blue'
              }`}
            >
              Gestion Salles
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-midnight-blue">Statistiques</h2>
              <button
                onClick={handleExportCSV}
                className="bg-neon-rose text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Exporter CSV
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Inscriptions</p>
                <p className="text-3xl font-bold text-midnight-blue">
                  {stats.overview.totalRegistrations}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Emails Vérifiés</p>
                <p className="text-3xl font-bold text-sky-aqua">
                  {stats.overview.verifiedUsers}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Équipes</p>
                <p className="text-3xl font-bold text-neon-rose">
                  {stats.overview.totalTeams}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Équipes Complètes</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.overview.completeTeams}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-midnight-blue mb-4">
                Répartition par lycée
              </h3>
              <div className="space-y-2">
                {stats.schoolDistribution.map((item: any) => (
                  <div key={item.school} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.school}</span>
                    <span className="font-bold text-midnight-blue">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-midnight-blue">
              Gestion des équipes ({teams.length})
            </h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-midnight-blue text-white">
                  <tr>
                    <th className="px-6 py-3 text-left">Nom</th>
                    <th className="px-6 py-3 text-left">Membres</th>
                    <th className="px-6 py-3 text-left">Statut</th>
                    <th className="px-6 py-3 text-left">Salle</th>
                    <th className="px-6 py-3 text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="border-b hover:bg-lavender-mist">
                      <td className="px-6 py-4 font-medium">{team.name}</td>
                      <td className="px-6 py-4">{team.memberCount} / 5</td>
                      <td className="px-6 py-4">
                        {team.isComplete ? (
                          <span className="text-green-600 font-medium">Complète</span>
                        ) : (
                          <span className="text-orange-600">Incomplète</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {team.roomNumber || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {team.currentScore} pts
                        {team.rank && ` (#${team.rank})`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-midnight-blue">Gestion des salles</h2>

            {[1, 2, 3, 4].map((roomNum) => {
              const roomTeams = teams.filter((t) => t.roomNumber === roomNum);
              return (
                <div key={roomNum} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-midnight-blue">
                      Salle {roomNum}
                    </h3>
                    <button
                      onClick={() => handleStartSession(roomNum)}
                      className="bg-sky-aqua text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                    >
                      Démarrer Session
                    </button>
                  </div>

                  <div className="space-y-2">
                    {roomTeams.length > 0 ? (
                      roomTeams.map((team) => (
                        <div key={team.id} className="flex justify-between items-center p-3 bg-lavender-mist rounded">
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-gray-600">{team.memberCount} membres</p>
                          </div>
                          <button
                            onClick={() => handleAssignRoom(team.id, 0 as any)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Retirer
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Aucune équipe assignée</p>
                    )}
                  </div>

                  {roomTeams.length < 5 && (
                    <div className="mt-4">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignRoom(e.target.value, roomNum);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Assigner une équipe...</option>
                        {teams
                          .filter((t) => !t.roomNumber)
                          .map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name} ({team.memberCount} membres)
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


