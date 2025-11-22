'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, ApiResponse } from '@/lib/types';
import { clearAuthData } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ctfdRedirectUrl?: string } | undefined>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifier si le token est valide en appelant l'API
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verifier le token avec l'API
          const response = await api.get<ApiResponse<User>>('/auth/profile');

          if (response.data.success && response.data.data) {
            // Token valide, mettre a jour l'utilisateur
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          } else {
            // Token invalide, nettoyer
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          // Erreur API (401, 403, etc.) = token invalide
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User; ctfdRedirectUrl?: string }>>('/auth/login', {
      email,
      password,
    });

    if (response.data.success && response.data.data) {
      const { token, user, ctfdRedirectUrl } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      // Retourner l'URL de redirection CTFd si disponible
      if (ctfdRedirectUrl) {
        return { ctfdRedirectUrl };
      }
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    api.post('/auth/logout').catch(() => {});
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


