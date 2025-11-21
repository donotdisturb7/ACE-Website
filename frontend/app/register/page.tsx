'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User, Mail, Lock, School, BookOpen, GraduationCap, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';
import FormField from '@/components/forms/FormField';
import FormSection from '@/components/forms/FormSection';
import SuccessMessage from '@/components/ui/SuccessMessage';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    school: '',
    grade: '',
    specialty: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        school: formData.school,
        grade: formData.grade,
        specialty: formData.specialty,
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de l&apos;inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-deep-navy relative overflow-hidden">
        <NavigationBar />
        <SuccessMessage
          title="Mission acceptée !"
          message="Un lien d'activation sécurisé a été envoyé à"
          email={formData.email}
          linkHref="/login"
          linkText="Retour à la base"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      <NavigationBar />
      <div className="py-12 px-4 relative overflow-hidden flex items-center justify-center min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-sky-aqua/10 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-neon-rose/10 blur-[100px] rounded-full -z-10" />

      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2 text-glow">Inscription</h1>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Identité */}
            <FormSection title="Identité" titleColor="text-sky-aqua">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  icon={User}
                  iconColor="text-gray-500"
                />
                <FormField
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  icon={User}
                  iconColor="text-gray-500"
                />
              </div>
            </FormSection>

            {/* Section Connexion */}
            <FormSection title="Identifiants" titleColor="text-neon-rose">
              <div className="space-y-6">
                <FormField
                  label="Email Académique"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@school.com"
                  required
                  icon={Mail}
                  iconColor="text-gray-500"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    icon={Lock}
                    iconColor="text-gray-500"
                  />
                  <FormField
                    label="Confirmation"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    icon={Lock}
                    iconColor="text-gray-500"
                  />
                </div>
              </div>
            </FormSection>

            {/* Section Scolarité */}
            <FormSection title="Informations" titleColor="text-purple-500">
              <div className="space-y-6">
                <FormField
                  label="Établissement"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Lycée Victor Hugo"
                  required
                  icon={School}
                  iconColor="text-gray-500"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    label="Niveau"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    icon={GraduationCap}
                    iconColor="text-gray-500"
                  >
                    <option value="" className="bg-deep-navy">Sélectionner...</option>
                    <option value="Seconde" className="bg-deep-navy">Seconde</option>
                    <option value="Première" className="bg-deep-navy">Première</option>
                    <option value="Terminale" className="bg-deep-navy">Terminale</option>
                  </FormField>
                  <FormField
                    label="Spécialité"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                    icon={BookOpen}
                    iconColor="text-gray-500"
                  >
                    <option value="" className="bg-deep-navy">Sélectionner...</option>
                    <option value="NSI" className="bg-deep-navy">NSI</option>
                    <option value="SI" className="bg-deep-navy">SI</option>
                    <option value="Mathématiques" className="bg-deep-navy">Mathématiques</option>
                    <option value="Autre" className="bg-deep-navy">Autre</option>
                  </FormField>
                </div>
              </div>
            </FormSection>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-rose hover:bg-neon-rose/90 text-white font-bold py-4 rounded-xl transition-all hover:shadow-neon disabled:opacity-50 flex items-center justify-center gap-2 group mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  Confirmer l&apos;inscription
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-sky-aqua hover:text-sky-aqua/80 font-medium hover:underline transition-all">
              Connexion
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
