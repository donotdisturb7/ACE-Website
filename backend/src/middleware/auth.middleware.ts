import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import authService from '../services/auth.service';
import { logger } from '../utils/logger';

/**
 * Middleware to protect routes - requires valid JWT
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header or cookie
    let token = authService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.',
      });
      return;
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré.',
    });
  }
};

/**
 * Middleware to restrict access to admins only
 */
export const adminOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Accès non autorisé.',
    });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs.',
    });
    return;
  }

  next();
};

/**
 * Middleware to check if email is verified
 */
export const emailVerified = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Accès non autorisé.',
    });
    return;
  }

  // Get user from database
  const { User } = require('../models/User');
  const user = await User.findByPk(req.user.id);

  if (!user || !user.emailVerified) {
    res.status(403).json({
      success: false,
      message: 'Email non vérifié. Veuillez vérifier votre email.',
    });
    return;
  }

  next();
};

