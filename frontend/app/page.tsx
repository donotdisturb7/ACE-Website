import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-blue via-lavender-mist to-sky-aqua">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">ACE 2025</h1>
        <div className="space-x-4">
          <Link 
            href="/login" 
            className="text-white hover:text-sky-aqua transition"
          >
            Connexion
          </Link>
          <Link 
            href="/register" 
            className="bg-neon-rose text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            S'inscrire
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
          ACE Escape Game
        </h2>
        <p className="text-2xl md:text-3xl text-sky-aqua mb-8">
          Cybersécurité 2025
        </p>
        <p className="text-xl text-white mb-12 max-w-2xl mx-auto">
          Rejoignez l'aventure cybersécurité la plus excitante de l'année ! 
          Formez votre équipe de 3 à 5 personnes et relevez les défis.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-3xl font-bold text-neon-rose mb-2">200</h3>
            <p>Participants attendus</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-3xl font-bold text-sky-aqua mb-2">4</h3>
            <p>Salles simultanées</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-white">
            <h3 className="text-3xl font-bold text-neon-rose mb-2">3-5</h3>
            <p>Membres par équipe</p>
          </div>
        </div>

        <Link 
          href="/register"
          className="inline-block bg-neon-rose text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-opacity-90 transition transform hover:scale-105"
        >
          Inscrivez-vous maintenant
        </Link>

        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8">Comment participer ?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-neon-rose mb-3">1</div>
              <h4 className="font-bold text-midnight-blue mb-2">Inscrivez-vous</h4>
              <p className="text-sm text-gray-600">
                Créez votre compte et validez votre email
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-sky-aqua mb-3">2</div>
              <h4 className="font-bold text-midnight-blue mb-2">Formez votre équipe</h4>
              <p className="text-sm text-gray-600">
                Créez ou rejoignez une équipe de 3 à 5 personnes
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-neon-rose mb-3">3</div>
              <h4 className="font-bold text-midnight-blue mb-2">Relevez les défis</h4>
              <p className="text-sm text-gray-600">
                Résolvez les challenges et grimpez au classement
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-white">
        <p>&copy; 2025 ACE Escape Game - Tous droits réservés</p>
      </footer>
    </div>
  );
}
