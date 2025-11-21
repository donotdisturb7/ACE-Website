import { Router } from 'express';
import { z } from 'zod';
import teamController from '../controllers/team.controller';
import { protect, emailVerified } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

const createTeamSchema = z.object({
  name: z.string().min(3, 'Le nom d\'équipe doit contenir au moins 3 caractères').max(50),
});

const joinTeamSchema = z.object({
  inviteCode: z.string().length(6, 'Code invalide'),
});

// Toutes les routes nécessitent une authentification et un email vérifié
router.use(protect, emailVerified);

router.post('/create', validate(createTeamSchema), teamController.createTeam);
router.post('/join', validate(joinTeamSchema), teamController.joinTeam);
router.get('/my-team', teamController.getMyTeam);
router.get('/:id', teamController.getTeam);
router.post('/leave', teamController.leaveTeam);

export default router;

