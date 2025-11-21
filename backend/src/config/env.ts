import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://aceuser:acepass@localhost:5432/acedb',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // CTFd
  ctfdApiUrl: process.env.CTFD_API_URL || '',
  ctfdApiToken: process.env.CTFD_API_TOKEN || '',
  ctfdUrl: process.env.CTFD_URL || 'http://ace-ctf-platform-ctfd-1:8000',
  
  // Email
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'ACE Escape Game <noreply@ace-escapegame.com>',
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Admin
  adminEmail: process.env.ADMIN_EMAIL || 'admin@ace-escapegame.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'changeme',
};

// Validate required environment variables
export const validateEnv = (): void => {
  if (!config.jwtSecret || config.jwtSecret === 'default-secret-key-change-in-production') {
    console.warn('⚠️  WARNING: Using default JWT secret. Set JWT_SECRET in production!');
  }
  
  if (!config.ctfdApiUrl) {
    console.warn('⚠️  WARNING: CTFD_API_URL not set. CTFd integration will not work.');
  }
  
  if (!config.smtpUser || !config.smtpPass) {
    console.warn('⚠️  WARNING: SMTP credentials not set. Email verification will not work.');
  }
};

