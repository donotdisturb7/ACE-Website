'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { UserPlus, Key, ArrowLeft, HelpCircle, Loader2, ArrowRight } from 'lucide-react';

export default function JoinTeamPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/teams/join', { inviteCode: inviteCode.toUpperCase() });
      if (response.data.success) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code d\'invitation invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-aqua/10 blur-[100px] rounded-full -z-10" />
      
      <div className="glass-panel p-8 rounded-2xl border border-white/10 max-w-lg w-full">
        <div className="mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au QG
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-sky-aqua" />
       
          </h1>
          <p className="text-gray-400">
            Saisissez le code d'accès pour intégrer une équipe.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <Key className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider ml-1 text-center">
              Code d'accès (6 caractères)
            </label>
            <div className="relative">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
                placeholder="ABC123"
                className="w-full bg-deep-navy/50 border border-white/10 rounded-xl py-4 px-4 text-center font-mono text-4xl font-bold text-sky-aqua tracking-[0.5em] placeholder:text-gray-700 placeholder:tracking-normal focus:outline-none focus:border-sky-aqua/50 focus:ring-1 focus:ring-sky-aqua/50 transition-all uppercase"
              />
            </div>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-white/5 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
               <HelpCircle className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Où trouver ce code ?
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Le code d'invitation est disponible sur le tableau de bord du Capitaine de l'équipe que vous souhaitez rejoindre.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || inviteCode.length !== 6}
              className="w-full bg-sky-aqua hover:bg-sky-aqua/90 text-white font-bold py-4 rounded-xl transition-all hover:shadow-neon-blue disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  Valider l'accès
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-2 text-xs text-gray-500 uppercase tracking-wider">Ou</span>
              </div>
            </div>

            <Link
              href="/team/create"
              className="w-full bg-transparent hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Créer une nouvelle équipe
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
