import Link from 'next/link';
import { Terminal, LogOut, Shield } from 'lucide-react';

interface DashboardHeaderProps {
  user: {
    firstName: string;
    isAdmin: boolean;
  };
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <nav className="border-b border-white/10 bg-deep-navy/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-rose rounded-lg flex items-center justify-center shadow-neon">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-wider">
            ACE<span className="text-sky-aqua">2025</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-gray-400">SYSTÈME EN LIGNE</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user.isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-rose/20 text-neon-rose border border-neon-rose/50 rounded-lg">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">ADMIN</span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

