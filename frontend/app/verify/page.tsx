'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShieldCheck, XCircle, Loader2, CheckCircle } from 'lucide-react';

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
        setMessage('Jeton de sécurité manquant');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Identité confirmée.');
          setTimeout(() => router.push('/login'), 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Échec de la vérification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center px-4 relative overflow-hidden">
       {/* Background Ambient Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-aqua/10 blur-[100px] rounded-full -z-10" />

      <div className="glass-panel p-8 rounded-2xl border border-white/10 max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-sky-aqua animate-spin mb-6" />
            <h2 className="text-2xl font-display font-bold text-white mb-2 animate-pulse">
              Analyse biométrique...
            </h2>
            <p className="text-gray-400 text-sm font-mono">Vérification des protocoles de sécurité</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
               <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Accès Autorisé
            </h2>
            <p className="text-green-400 mb-6 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 w-full">
              {message}
            </p>
            <p className="text-xs text-gray-500 font-mono">Redirection vers le sas de connexion...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
               <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Accès Refusé
            </h2>
            <p className="text-red-400 mb-8 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 w-full">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-surface hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-sky-aqua font-mono animate-pulse">INITIALISATION...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
