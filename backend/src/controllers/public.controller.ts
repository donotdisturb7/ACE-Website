import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Team } from '../models/Team';
import { logger } from '../utils/logger';

export class PublicController {
  // Obtenir le classement public (sans authentification)
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const teams = await Team.findAll({
        attributes: ['id', 'name', 'currentScore', 'rank', 'roomNumber'],
        order: [['currentScore', 'DESC'], ['rank', 'ASC']],
      });

      res.json({
        success: true,
        data: { teams },
      });
    } catch (error) {
      logger.error('Get public leaderboard error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du classement.' 
      });
    }
  }
}

export default new PublicController();

