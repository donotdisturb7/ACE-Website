import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

interface HCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Vérifie un token hCaptcha
 * @param token Token hCaptcha du client
 * @param remoteIp IP du client (optionnel)
 * @returns true si le captcha est valide, false sinon
 */
export async function verifyCaptcha(token: string, remoteIp?: string): Promise<boolean> {
  // HCAPTCHA_SECRET obligatoire (dev + prod)
  if (!process.env.HCAPTCHA_SECRET) {
    logger.error('HCAPTCHA_SECRET non défini');
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', process.env.HCAPTCHA_SECRET);
    params.append('response', token);

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await axios.post<HCaptchaVerifyResponse>(
      'https://hcaptcha.com/siteverify',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      }
    );

    if (!response.data.success) {
      logger.warn('CAPTCHA verification failed:', {
        errors: response.data['error-codes'],
        ip: remoteIp,
      });
      return false;
    }

    logger.info('CAPTCHA verified successfully');
    return true;
  } catch (error) {
    logger.error('Error verifying CAPTCHA:', error);
    // En cas d'erreur de l'API hCaptcha, on refuse par sécurité
    return false;
  }
}

/**
 * Vérifie si le CAPTCHA est requis pour cette requête
 * @returns true si le CAPTCHA est requis, false sinon
 */
export function isCaptchaRequired(): boolean {
  // CAPTCHA requis si HCAPTCHA_SECRET est défini
  return !!process.env.HCAPTCHA_SECRET;
}
