import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const transportConfig: any = {
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false, // true for 465, false for other ports
      pool: true, // Use connection pooling for faster emails
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 2000, // 2 seconds timeout
      greetingTimeout: 2000,
    };

    // MailHog et autres serveurs SMTP locaux n'ont pas besoin d'authentification
    if (config.smtpUser && config.smtpPass) {
      transportConfig.auth = {
        user: config.smtpUser,
        pass: config.smtpPass,
      };
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify?token=${token}`;
    
    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Vérifiez votre email - ACE Escape Game',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1a187d 0%, #fc10ca 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f6f2f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                padding: 15px 30px;
                background: #fc10ca;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ACE 2025</h1>
                <p>Bienvenue dans l'aventure cybersécurité !</p>
              </div>
              <div class="content">
                <h2>Bonjour ${firstName} ! </h2>
                <p>Merci de vous être inscrit à l'ACE Escape Game 2025.</p>
                <p>Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                <center>
                  <a href="${verificationUrl}" class="button">Vérifier mon email</a>
                </center>
                <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #09c7df;">${verificationUrl}</p>
                <p><strong>Ce lien expire dans 24 heures.</strong></p>
                <p>Après vérification, vous pourrez créer ou rejoindre une équipe de 3 à 5 personnes.</p>
              </div>
              <div class="footer">
                <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
                <p>© 2025 ACE Escape Game - Événement Cybersécurité</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, teamName: string): Promise<void> {
    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Bienvenue dans votre équipe - ACE Escape Game',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1a187d 0%, #09c7df 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f6f2f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Équipe formée !</h1>
              </div>
              <div class="content">
                <h2>Félicitations ${firstName} !</h2>
                <p>Vous faites maintenant partie de l'équipe <strong>${teamName}</strong>.</p>
                <p>Vous recevrez plus d'informations sur l'événement dans les prochains jours.</p>
                <p>À bientôt pour l'ACE Escape Game ! 🚀</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: config.smtpFrom,
      to: email,
      subject: 'Réinitialisation de mot de passe - ACE - Vizyon Dijital',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Réinitialisation de mot de passe</h2>
              <p>Bonjour ${firstName},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
              <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #fc10ca; color: white; text-decoration: none; border-radius: 5px;">
                Réinitialiser mon mot de passe
              </a>
              <p>Ce lien expire dans 1 heure.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export default new EmailService();

