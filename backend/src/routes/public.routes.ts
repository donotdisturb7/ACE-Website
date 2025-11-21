import { Router } from 'express';
import publicController from '../controllers/public.controller';

const router = Router();

// Routes publiques (sans authentification)
router.get('/leaderboard', publicController.getLeaderboard);

export default router;

