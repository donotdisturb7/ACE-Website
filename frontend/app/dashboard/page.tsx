'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Clock, Users } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminActions } from '@/hooks/useAdminActions';
import { useTeamData } from '@/hooks/useTeamData';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserProfile from '@/components/dashboard/UserProfile';
import TeamSection from '@/components/dashboard/TeamSection';
import AdminTabs from '@/components/dashboard/AdminTabs';
import AdminStats from '@/components/dashboard/AdminStats';
import AdminTeamsList from '@/components/dashboard/AdminTeamsList';
import AdminRoomsManagement from '@/components/dashboard/AdminRoomsManagement';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const { team, loading: teamLoading, setTeam } = useTeamData();
  const { stats, teams: allTeams, loading: adminLoading, updateTeam } = useAdminData(user?.isAdmin ?? false);
  const { handleExportCSV, handleAssignRoom, handleStartSession } = useAdminActions(allTeams, updateTeam);
  const [activeTab, setActiveTab] = useState<'team' | 'stats' | 'teams' | 'rooms'>('team');
  const [leavingTeam, setLeavingTeam] = useState(false);

  const loading = teamLoading || (user?.isAdmin && adminLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAssignRoomWithAlert = async (teamId: string, roomNumber: number) => {
    try {
      await handleAssignRoom(teamId, roomNumber);
    } catch {
      alert('Erreur lors de l&apos;assignation');
    }
  };

  const handleStartSessionWithConfirm = async (roomNumber: number) => {
    if (!confirm(`Démarrer la session pour la salle ${roomNumber} ?`)) return;
    try {
      await handleStartSession(roomNumber);
      alert(`Session démarrée pour la salle ${roomNumber}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erreur lors du démarrage');
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    
    const isCaptain = team.captainId === user?.id;
    const confirmMessage = isCaptain
      ? `Êtes-vous sûr de vouloir supprimer l'équipe "${team.name}" ? Cette action est irréversible et tous les membres seront retirés.`
      : `Êtes-vous sûr de vouloir quitter l'équipe "${team.name}" ?`;
    
    if (!confirm(confirmMessage)) return;
    
    setLeavingTeam(true);
    try {
      const response = await api.post('/teams/leave');
      if (response.data.success) {
        // Refresh user profile to update teamId
        const profileResponse = await api.get('/auth/profile');
        if (profileResponse.data.success) {
          updateUser(profileResponse.data.data);
        }
        setTeam(null);
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Erreur lors de la sortie de l\'équipe');
    } finally {
      setLeavingTeam(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-aqua/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-rose/5 blur-[120px] rounded-full pointer-events-none" />

      <DashboardHeader user={user} onLogout={logout} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Bonjour, {user.firstName} !
            </h1>
            <p className="text-gray-400">Bienvenue dans votre dashboard.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-sky-aqua/10 border border-sky-aqua/20 rounded-xl">
            <Clock className="w-5 h-5 text-sky-aqua" />
            <span className="text-sky-aqua font-mono font-bold">J-?? AVANT LE LANCEMENT</span>
          </div>
        </div>

        {/* Admin Tabs */}
        {user.isAdmin && (
          <div className="mb-6">
            <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && user.isAdmin && stats && (
          <AdminStats stats={stats} onExportCSV={handleExportCSV} />
        )}

        {/* All Teams Tab */}
        {activeTab === 'teams' && user.isAdmin && (
          <AdminTeamsList teams={allTeams} />
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && user.isAdmin && (
          <AdminRoomsManagement 
            teams={allTeams} 
            onAssignRoom={handleAssignRoomWithAlert}
            onStartSession={handleStartSessionWithConfirm}
          />
        )}

        {/* Team Tab (default) */}
        {activeTab === 'team' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Column 1: User Profile */}
            <div className="lg:col-span-1">
              <UserProfile user={user} />
            </div>

            {/* Column 2 & 3: Team Section */}
            <div className="lg:col-span-2">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 h-full">
                <h3 className="flex items-center gap-2 font-display text-xl font-bold text-white mb-6">
                  <Users className="w-6 h-6 text-purple-500" />
                  Statut de l&apos;équipe
                </h3>
                <TeamSection 
                  team={team} 
                  userId={user.id} 
                  onLeaveTeam={handleLeaveTeam}
                  leavingTeam={leavingTeam}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
