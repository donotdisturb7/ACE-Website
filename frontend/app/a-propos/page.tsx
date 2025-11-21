'use client';

import NavigationBar from '@/components/NavigationBar';

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-deep-navy relative overflow-hidden">
      <NavigationBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-rose to-sky-aqua">
                À propos
              </span>
            </h1>
          </div>

          {/* Link Section */}
          <div className="glass-panel p-8 text-center">
            <a
              href="https://www.vizyondijital.fr/index.php?page=home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-mono text-sky-aqua hover:text-neon-rose transition-colors underline decoration-2 underline-offset-4"
            >
              https://www.vizyondijital.fr/
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

