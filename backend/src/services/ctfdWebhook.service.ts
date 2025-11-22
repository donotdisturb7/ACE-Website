import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/env';

const CTFD_WEBHOOK_URL = process.env.CTFD_WEBHOOK_URL || 'http://ace-ctf-platform-ctfd-1:8000/api/registration-sync/webhook';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'ace2025_webhook_secret_shared';

export class CTFdWebhookService {
  private static generateSignature(payload: string): string {
    return crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
  }

  private static async sendWebhook(event: string, data: any): Promise<void> {
    try {
      const payload = JSON.stringify({ event, data });
      const signature = this.generateSignature(payload);

      await axios.post(CTFD_WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        timeout: 5000,
      });

      console.log(`Webhook envoyé à CTFd: ${event}`);
    } catch (error) {
      console.error(`Erreur webhook CTFd (${event}):`, error);
    }
  }

  static async notifyTeamCreated(teamId: string): Promise<void> {
    await this.sendWebhook('team.created', { teamId });
  }

  static async notifyTeamUpdated(teamId: string): Promise<void> {
    await this.sendWebhook('team.updated', { teamId });
  }

  static async notifyTeamDeleted(teamId: string, ctfdTeamId?: number | null, teamName?: string): Promise<void> {
    await this.sendWebhook('team.deleted', { teamId, ctfdTeamId, teamName });
  }

  static async notifyMemberAdded(teamId: string, userId: string): Promise<void> {
    await this.sendWebhook('team.member_added', { teamId, userId });
  }

  static async notifyMemberRemoved(teamId: string, userId: string): Promise<void> {
    await this.sendWebhook('team.member_removed', { teamId, userId });
  }
}
