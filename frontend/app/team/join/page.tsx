'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

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
    <div className="min-h-screen bg-gradient-to-br from-midnight-blue to-sky-aqua flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-midnight-blue mb-2">Rejoindre une équipe</h1>
        <p className="text-gray-600 mb-6">
          Entrez le code d'invitation de votre équipe
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code d'invitation
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              placeholder="ABC123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-sky-aqua focus:border-transparent uppercase"
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              6 caractères (lettres et chiffres)
            </p>
          </div>

          <div className="bg-lavender-mist p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Comment obtenir le code ?</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Demandez le code d'invitation au capitaine de l'équipe que vous souhaitez rejoindre.
              Ce code est visible dans son tableau de bord.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || inviteCode.length !== 6}
            className="w-full bg-sky-aqua text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Rejoindre l\'équipe'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Ou</p>
          <Link
            href="/team/create"
            className="text-neon-rose hover:underline font-medium"
          >
            Créer votre propre équipe
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-gray-600 hover:text-midnight-blue">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}


