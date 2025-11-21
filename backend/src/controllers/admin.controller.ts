import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Registration, RegistrationStatus } from '../models/Registration';
import { logger } from '../utils/logger';

export class AdminController {
  // Statistiques globales
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const totalRegistrations = await User.count();
      const verifiedUsers = await User.count({ where: { emailVerified: true } });
      const totalTeams = await Team.count();
      const completeTeams = await Team.count({ where: { isComplete: true } });

      // Répartition par lycée
      const schoolDistribution = await User.findAll({
        attributes: ['school', [User.sequelize!.fn('COUNT', 'id'), 'count']],
        group: ['school'],
        raw: true,
      });

      // Statut des inscriptions
      const registrationStatus = await Registration.findAll({
        attributes: ['status', [Registration.sequelize!.fn('COUNT', 'id'), 'count']],
        group: ['status'],
        raw: true,
      });

      // Répartition par salle
      const roomDistribution = await Team.findAll({
        attributes: ['roomNumber', [Team.sequelize!.fn('COUNT', 'id'), 'teamCount']],
        where: { roomNumber: { [Op.not]: null } },
        group: ['roomNumber'],
        raw: true,
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalRegistrations,
            verifiedUsers,
            totalTeams,
            completeTeams,
            incompleteTeams: totalTeams - completeTeams,
          },
          schoolDistribution,
          registrationStatus,
          roomDistribution,
        },
      });
    } catch (error) {
      logger.error('Get stats error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques.' });
    }
  }

  // Liste de toutes les inscriptions
  async getRegistrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, school, hasTeam } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const registrations = await Registration.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'school', 'grade', 'specialty', 'emailVerified'],
            where: school ? { school } : undefined,
          },
          {
            model: Team,
            as: 'team',
            required: hasTeam === 'true',
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: { registrations, count: registrations.length },
      });
    } catch (error) {
      logger.error('Get registrations error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des inscriptions.' });
    }
  }

  // Export CSV
  async exportCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      const registrations = await Registration.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'school', 'grade', 'specialty', 'emailVerified'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['name', 'roomNumber'],
          },
        ],
      });

      // Générer CSV
      const csvHeader = 'Prénom,Nom,Email,Lycée,Classe,Spécialité,Email Vérifié,Équipe,Salle,Statut\n';
      const csvRows = registrations.map((reg: any) => {
        const user = reg.user;
        const team = reg.team;
        return [
          user.firstName,
          user.lastName,
          user.email,
          user.school,
          user.grade,
          user.specialty,
          user.emailVerified ? 'Oui' : 'Non',
          team?.name || 'Aucune',
          team?.roomNumber || '',
          reg.status,
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inscriptions-ace.csv');
      res.send(csv);
    } catch (error) {
      logger.error('Export CSV error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'export CSV.' });
    }
  }

  // Assigner des équipes aux salles
  async assignRooms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { assignments } = req.body; // [{ teamId, roomNumber }]

      for (const assignment of assignments) {
        await Team.update(
          { roomNumber: assignment.roomNumber },
          { where: { id: assignment.teamId } }
        );
      }

      logger.info(`Rooms assigned: ${assignments.length} teams`);

      res.json({
        success: true,
        message: 'Salles assignées avec succès.',
      });
    } catch (error) {
      logger.error('Assign rooms error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'assignation des salles.' });
    }
  }

  // Démarrer une session pour une salle
  async startSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomNumber } = req.body;

      const teams = await Team.findAll({ where: { roomNumber } });

      if (teams.length === 0) {
        res.status(404).json({ success: false, message: 'Aucune équipe assignée à cette salle.' });
        return;
      }

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // 90 minutes

      for (const team of teams) {
        team.sessionStartTime = startTime;
        team.sessionEndTime = endTime;
        await team.save();
      }

      logger.info(`Session started for room ${roomNumber}`);

      res.json({
        success: true,
        message: `Session démarrée pour la salle ${roomNumber}.`,
        data: { startTime, endTime },
      });
    } catch (error) {
      logger.error('Start session error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du démarrage de la session.' });
    }
  }

  // Arrêter une session pour une salle
  async stopSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roomNumber } = req.body;

      await Team.update(
        { sessionStartTime: null, sessionEndTime: null },
        { where: { roomNumber } }
      );

      logger.info(`Session stopped for room ${roomNumber}`);

      res.json({
        success: true,
        message: `Session arrêtée pour la salle ${roomNumber}.`,
      });
    } catch (error) {
      logger.error('Stop session error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'arrêt de la session.' });
    }
  }

  // Liste de toutes les équipes
  async getAllTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { complete, roomNumber } = req.query;

      const where: any = {};
      if (complete !== undefined) where.isComplete = complete === 'true';
      if (roomNumber) where.roomNumber = parseInt(roomNumber as string);

      const teams = await Team.findAll({
        where,
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'firstName', 'lastName', 'email', 'school'],
          },
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Ajouter le nombre de membres à chaque équipe
      const teamsWithCount = await Promise.all(
        teams.map(async (team) => ({
          ...team.toJSON(),
          memberCount: await team.getMemberCount(),
        }))
      );

      res.json({
        success: true,
        data: { teams: teamsWithCount, count: teams.length },
      });
    } catch (error) {
      logger.error('Get all teams error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des équipes.' });
    }
  }

  // Obtenir les scores de toutes les équipes
  async getScores(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teams = await Team.findAll({
        attributes: ['id', 'name', 'currentScore', 'rank', 'roomNumber'],
        order: [['currentScore', 'DESC']],
      });

      res.json({
        success: true,
        data: { teams },
      });
    } catch (error) {
      logger.error('Get scores error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des scores.' });
    }
  }

  // Mettre à jour un utilisateur (admin uniquement)
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      await user.update(updates);

      logger.info(`User ${userId} updated by admin`);

      res.json({
        success: true,
        message: 'Utilisateur mis à jour.',
        data: { user },
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour.' });
    }
  }

  // Supprimer une équipe (admin uniquement)
  async deleteTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;

      const team = await Team.findByPk(teamId);
      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      // Retirer tous les membres de l'équipe
      await User.update({ teamId: null }, { where: { teamId } });
      await Registration.update(
        { teamId: null, status: RegistrationStatus.VERIFIED },
        { where: { teamId } }
      );

      await team.destroy();

      logger.info(`Team ${teamId} deleted by admin`);

      res.json({
        success: true,
        message: 'Équipe supprimée.',
      });
    } catch (error) {
      logger.error('Delete team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression.' });
    }
  }
}

export default new AdminController();

