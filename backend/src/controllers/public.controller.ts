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

      // Charger les noms des salles
      const fs = require('fs');
      const path = require('path');
      const roomsFile = path.join(__dirname, '../../data/rooms.json');
      let roomNames = {};

      if (fs.existsSync(roomsFile)) {
        try {
          roomNames = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
        } catch (e) {
          logger.error('Error reading rooms file:', e);
        }
      }

      res.json({
        success: true,
        data: { teams, roomNames },
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

