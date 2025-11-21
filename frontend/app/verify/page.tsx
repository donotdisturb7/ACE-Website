'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token manquant');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email vérifié avec succès !');
          setTimeout(() => router.push('/login'), 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Erreur lors de la vérification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-blue to-sky-aqua flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-midnight-blue mb-4">
              Vérification en cours...
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-midnight-blue mb-4">
              Email vérifié !
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirection automatique...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-midnight-blue mb-4">
              Erreur de vérification
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-midnight-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              Aller à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-midnight-blue to-sky-aqua flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}


