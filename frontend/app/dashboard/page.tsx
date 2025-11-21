'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Team } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // En dev : pas de vérification d'email obligatoire
    // if (user && !user.emailVerified) {
    //   router.push('/verify');
    //   return;
    // }

    const fetchTeam = async () => {
      if (!user?.teamId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/teams/my-team');
        if (response.data.success) {
          setTeam(response.data.data.team);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeam();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-lavender-mist flex items-center justify-center">
        <div className="text-midnight-blue text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-lavender-mist">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-midnight-blue">ACE 2025</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user.firstName} {user.lastName}
            </span>
            {user.isAdmin && (
              <Link
                href="/admin"
                className="bg-neon-rose text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="text-gray-600 hover:text-midnight-blue transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-midnight-blue mb-8">
          Tableau de bord
        </h2>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-midnight-blue mb-4">
            Mes informations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lycée</p>
              <p className="font-medium">{user.school}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Classe & Spécialité</p>
              <p className="font-medium">{user.grade} - {user.specialty}</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        {!user.teamId ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-midnight-blue mb-4">
              Rejoindre ou créer une équipe
            </h3>
            <p className="text-gray-600 mb-6">
              Vous devez faire partie d'une équipe de 3 à 5 personnes pour participer.
            </p>
            <div className="flex gap-4">
              <Link
                href="/team/create"
                className="flex-1 bg-neon-rose text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-opacity-90 transition"
              >
                Créer une équipe
              </Link>
              <Link
                href="/team/join"
                className="flex-1 bg-sky-aqua text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-opacity-90 transition"
              >
                Rejoindre une équipe
              </Link>
            </div>
          </div>
        ) : team ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-midnight-blue">{team.name}</h3>
                <p className="text-gray-600">
                  {team.memberCount} / 5 membres
                  {team.isComplete ? ' ✅' : ' (Équipe incomplète)'}
                </p>
              </div>
              {team.captainId === user.id && (
                <span className="bg-neon-rose text-white px-3 py-1 rounded-full text-sm">
                  Capitaine
                </span>
              )}
            </div>

            <div className="bg-lavender-mist p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">Code d'invitation</p>
              <p className="text-2xl font-bold text-midnight-blue tracking-wider">
                {team.inviteCode}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Partagez ce code avec vos coéquipiers
              </p>
            </div>

            <h4 className="font-bold text-midnight-blue mb-3">Membres de l'équipe</h4>
            <div className="space-y-2">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-lavender-mist rounded-lg"
                >
                  <div>
                    <p className="font-medium text-midnight-blue">
                      {member.firstName} {member.lastName}
                      {member.id === team.captainId && ' 👑'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.school} - {member.grade}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {team.roomNumber && (
              <div className="mt-6 bg-sky-aqua bg-opacity-10 border border-sky-aqua rounded-lg p-4">
                <p className="font-bold text-midnight-blue">
                  Salle assignée : Salle {team.roomNumber}
                </p>
              </div>
            )}

            {team.currentScore > 0 && (
              <div className="mt-4 bg-neon-rose bg-opacity-10 border border-neon-rose rounded-lg p-4">
                <p className="font-bold text-midnight-blue">
                  Score actuel : {team.currentScore} points
                  {team.rank && ` | Classement : #${team.rank}`}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}


