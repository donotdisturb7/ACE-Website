import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for auth routes
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Trop de tentatives. Réessayez dans 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

