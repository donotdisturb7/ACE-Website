import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import ctfdService from '../services/ctfd.service';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

const router = Router();

/**
 * Endpoint pour créer une session SSO CTFd et obtenir l'URL de redirection
 * Nécessite une authentification
 */
router.post('/sso/redirect', protect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    // Récupérer le token depuis le cookie ou header
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token manquant',
      });
    }

    // Créer la session SSO dans CTFd
    const redirectUrl = await ctfdService.createSSOSession(token, req.user.email);

    if (!redirectUrl) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de session CTFd',
      });
    }

    res.json({
      success: true,
      data: {
        redirect_url: redirectUrl,
      },
    });
  } catch (error) {
    logger.error('Erreur SSO CTFd redirect:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de session CTFd',
    });
  }
});

export default router;

