import { Response } from 'express';
import { AuthRequest } from '../types';
import ctfdService from '../services/ctfd.service';
import { Team } from '../models/Team';
import { logger } from '../utils/logger';

export class CTFdController {
  // Synchroniser les scores depuis CTFd
  async syncScores(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teams = await Team.findAll({
        attributes: ['id', 'ctfdTeamId'],
        where: { ctfdTeamId: { $ne: null } },
      });

      await ctfdService.syncAllScores(teams as any);

      res.json({
        success: true,
        message: 'Scores synchronisés avec succès.',
      });
    } catch (error) {
      logger.error('Sync scores error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la synchronisation.' });
    }
  }

  // Health check CTFd
  async healthCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      const isHealthy = await ctfdService.healthCheck();

      res.json({
        success: true,
        data: { healthy: isHealthy },
      });
    } catch (error) {
      logger.error('CTFd health check error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du health check.' });
    }
  }

  // Obtenir le scoreboard CTFd
  async getScoreboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scoreboard = await ctfdService.getScoreboard();

      res.json({
        success: true,
        data: { scoreboard },
      });
    } catch (error) {
      logger.error('Get scoreboard error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération du scoreboard.' });
    }
  }
}

export default new CTFdController();

