'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function CreateTeamPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/teams/create', { name: teamName });
      if (response.data.success) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-blue to-neon-rose flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-midnight-blue mb-2">Créer une équipe</h1>
        <p className="text-gray-600 mb-6">
          Choisissez un nom unique pour votre équipe
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'équipe
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              placeholder="Ex: Les Hackers"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neon-rose focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              3-50 caractères. Ce nom doit être unique.
            </p>
          </div>

          <div className="bg-lavender-mist p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>À savoir :</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Vous deviendrez le capitaine de l'équipe</li>
              <li>Un code d'invitation sera généré automatiquement</li>
              <li>Votre équipe peut avoir de 3 à 5 membres</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-rose text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer l\'équipe'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-gray-600 hover:text-midnight-blue">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}


