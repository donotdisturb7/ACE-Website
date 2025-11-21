import crypto from 'crypto';

/**
 * Generate a random alphanumeric code
 */
export const generateCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Generate a random token for email verification
 */
export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a random password
 */
export const generatePassword = (length: number = 12): string => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

