/**
 * Utilitaires d'authentification
 */

/**
 * Nettoie toutes les données d'authentification
 * Utile après un fresh-all ou pour déconnecter complètement
 */
export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Nettoyer aussi les cookies si nécessaire
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
}

/**
 * Vérifie si un token existe (sans vérifier sa validité)
 */
export function hasToken(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * Obtient le token actuel
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Obtient l'utilisateur sauvegardé (sans vérifier si le token est valide)
 */
export function getSavedUser(): any | null {
  const savedUser = localStorage.getItem('user');
  return savedUser ? JSON.parse(savedUser) : null;
}
