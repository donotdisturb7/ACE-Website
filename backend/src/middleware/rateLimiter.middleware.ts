import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * Whitelist of hostnames/services that should bypass rate limiting
 */
const whitelist = [
  'ace-ctf-platform-ctfd-1',
];

/**
 * Check if a request should skip rate limiting
 */
const skipWhitelisted = (req: Request): boolean => {
  // Get client IP (handling proxies correctly)
  const clientIp = req.ip ||
                   req.socket.remoteAddress ||
                   (req.get('x-forwarded-for')?.split(',')[0]?.trim()) ||
                   '';

  // Docker bridge networks typically use 172.x.x.x or 10.x.x.x ranges
  // Check if request comes from Docker internal network
  const isDockerInternal =
    clientIp.startsWith('172.') ||
    clientIp.startsWith('10.') ||
    clientIp.includes('::ffff:172.') || // IPv6-mapped IPv4
    clientIp.includes('::ffff:10.');

  if (isDockerInternal) {
    return true;
  }

  // Fallback: Check for custom header or hostname
  const hostname = req.hostname || req.get('host') || '';
  const userAgent = req.get('user-agent') || '';
  const forwardedHost = req.get('x-forwarded-host') || '';
  const serviceName = req.get('x-service-name') || '';

  // Check if any identifier contains a whitelisted service name
  const identifiers = [hostname, userAgent, forwardedHost, serviceName].join(' ').toLowerCase();

  return whitelist.some(service =>
    identifiers.includes(service.toLowerCase())
  );
};

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
  skip: skipWhitelisted,
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
  skip: skipWhitelisted,
});

