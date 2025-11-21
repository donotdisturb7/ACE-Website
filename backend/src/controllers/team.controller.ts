import { Response } from 'express';
import { Team } from '../models/Team';
import { User } from '../models/User';
import { Registration, RegistrationStatus } from '../models/Registration';
import { AuthRequest } from '../types';
import { generateCode } from '../utils/crypto';
import { logger } from '../utils/logger';
import emailService from '../services/email.service';

export class TeamController {
  // Créer une nouvelle équipe
  async createTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { name } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      if (!user.emailVerified) {
        res.status(403).json({ success: false, message: 'Email non vérifié.' });
        return;
      }

      if (user.teamId) {
        res.status(400).json({ success: false, message: 'Vous faites déjà partie d\'une équipe.' });
        return;
      }

      // Vérifier que le nom d'équipe est unique
      const existingTeam = await Team.findOne({ where: { name } });
      if (existingTeam) {
        res.status(400).json({ success: false, message: 'Ce nom d\'équipe existe déjà.' });
        return;
      }

      // Générer un code d'invitation unique
      let inviteCode: string;
      let codeExists = true;
      
      while (codeExists) {
        inviteCode = generateCode(6);
        const teamWithCode = await Team.findOne({ where: { inviteCode } });
        codeExists = !!teamWithCode;
      }

      const team = await Team.create({
        name,
        inviteCode: inviteCode!,
        captainId: userId,
        isComplete: false,
      });

      // Ajouter l'utilisateur à l'équipe
      user.teamId = team.id;
      await user.save();

      // Mettre à jour l'inscription
      await Registration.update(
        { teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE },
        { where: { userId } }
      );

      logger.info(`Team created: ${name} by ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'Équipe créée avec succès !',
        data: {
          team: {
            id: team.id,
            name: team.name,
            inviteCode: team.inviteCode,
            captainId: team.captainId,
          },
        },
      });
    } catch (error) {
      logger.error('Create team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'équipe.' });
    }
  }

  // Rejoindre une équipe avec un code d'invitation
  async joinTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const { inviteCode } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        return;
      }

      if (!user.emailVerified) {
        res.status(403).json({ success: false, message: 'Email non vérifié.' });
        return;
      }

      if (user.teamId) {
        res.status(400).json({ success: false, message: 'Vous faites déjà partie d\'une équipe.' });
        return;
      }

      const team = await Team.findOne({ where: { inviteCode } });
      if (!team) {
        res.status(404).json({ success: false, message: 'Code d\'invitation invalide.' });
        return;
      }

      // Vérifier si l'équipe est pleine
      const isFull = await team.isFull();
      if (isFull) {
        res.status(400).json({ success: false, message: 'Cette équipe est complète (5 membres max).' });
        return;
      }

      // Ajouter l'utilisateur à l'équipe
      user.teamId = team.id;
      await user.save();

      // Mettre à jour l'inscription
      await Registration.update(
        { teamId: team.id, status: RegistrationStatus.TEAM_INCOMPLETE },
        { where: { userId } }
      );

      // Vérifier si l'équipe est maintenant complète
      const memberCount = await team.getMemberCount();
      if (memberCount >= 3 && memberCount <= 5) {
        team.isComplete = memberCount >= 3;
        await team.save();

        if (team.isComplete) {
          await Registration.update(
            { status: RegistrationStatus.TEAM_COMPLETE },
            { where: { teamId: team.id } }
          );
        }
      }

      // Envoyer email de bienvenue
      await emailService.sendWelcomeEmail(user.email, user.firstName, team.name);

      logger.info(`User ${user.email} joined team ${team.name}`);

      res.json({
        success: true,
        message: 'Vous avez rejoint l\'équipe avec succès !',
        data: {
          team: {
            id: team.id,
            name: team.name,
          },
        },
      });
    } catch (error) {
      logger.error('Join team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la jonction à l\'équipe.' });
    }
  }

  // Obtenir les détails d'une équipe
  async getTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const team = await Team.findByPk(id, {
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'firstName', 'lastName', 'email', 'school', 'grade'],
          },
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      const memberCount = await team.getMemberCount();

      res.json({
        success: true,
        data: {
          team: {
            id: team.id,
            name: team.name,
            inviteCode: team.inviteCode,
            captainId: team.captainId,
            captain: team.captain,
            members: team.members,
            memberCount,
            isComplete: team.isComplete,
            roomNumber: team.roomNumber,
            sessionStartTime: team.sessionStartTime,
          },
        },
      });
    } catch (error) {
      logger.error('Get team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'équipe.' });
    }
  }

  // Quitter une équipe
  async leaveTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (!user || !user.teamId) {
        res.status(400).json({ success: false, message: 'Vous ne faites pas partie d\'une équipe.' });
        return;
      }

      const team = await Team.findByPk(user.teamId);
      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      // Si c'est le capitaine, on supprime l'équipe
      if (team.captainId === userId) {
        await User.update({ teamId: null }, { where: { teamId: team.id } });
        await Registration.update(
          { teamId: null, status: RegistrationStatus.VERIFIED },
          { where: { teamId: team.id } }
        );
        await team.destroy();
        
        logger.info(`Team ${team.name} deleted by captain`);
        res.json({ success: true, message: 'Équipe supprimée.' });
      } else {
        // Sinon on retire juste l'utilisateur
        user.teamId = null;
        await user.save();

        await Registration.update(
          { teamId: null, status: RegistrationStatus.VERIFIED },
          { where: { userId } }
        );

        // Mettre à jour le statut de l'équipe
        const memberCount = await team.getMemberCount();
        team.isComplete = memberCount >= 3 && memberCount <= 5;
        await team.save();

        logger.info(`User ${user.email} left team ${team.name}`);
        res.json({ success: true, message: 'Vous avez quitté l\'équipe.' });
      }
    } catch (error) {
      logger.error('Leave team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du départ de l\'équipe.' });
    }
  }

  // Obtenir l'équipe de l'utilisateur connecté
  async getMyTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié.' });
        return;
      }

      const user = await User.findByPk(req.user.id);
      if (!user || !user.teamId) {
        res.status(404).json({ success: false, message: 'Vous ne faites pas partie d\'une équipe.' });
        return;
      }

      const team = await Team.findByPk(user.teamId, {
        attributes: ['id', 'name', 'inviteCode', 'captainId', 'isComplete', 'roomNumber', 'sessionStartTime', 'currentScore', 'rank'],
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'firstName', 'lastName', 'email', 'school', 'grade', 'specialty'],
          },
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Équipe non trouvée.' });
        return;
      }

      const memberCount = await team.getMemberCount();

      res.json({
        success: true,
        data: {
          team: {
            id: team.id,
            name: team.name,
            inviteCode: team.inviteCode,
            captainId: team.captainId,
            captain: team.captain,
            members: team.members,
            memberCount,
            isComplete: team.isComplete,
            roomNumber: team.roomNumber,
            sessionStartTime: team.sessionStartTime,
            currentScore: team.currentScore,
            rank: team.rank,
          },
        },
      });
    } catch (error) {
      logger.error('Get my team error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération de votre équipe.' });
    }
  }
}

export default new TeamController();

