import { Router } from 'express';
import { z } from 'zod';
import authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Schémas de validation
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  school: z.string().min(2, 'Lycée requis'),
  grade: z.string().min(1, 'Classe requise'),
  specialty: z.string().min(2, 'Spécialité requise'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requis'),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Email invalide'),
});

// Routes publiques
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendVerificationSchema), authController.resendVerification);

// Routes protégées
router.get('/profile', protect, authController.getProfile);
router.post('/logout', authController.logout);

export default router;

