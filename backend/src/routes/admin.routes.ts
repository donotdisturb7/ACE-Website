import { Router } from 'express';
import { z } from 'zod';
import adminController from '../controllers/admin.controller';
import ctfdController from '../controllers/ctfd.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification admin
router.use(protect, adminOnly);

const assignRoomsSchema = z.object({
  assignments: z.array(
    z.object({
      teamId: z.string().uuid(),
      roomNumber: z.number().min(0),
    })
  ),
});

const sessionSchema = z.object({
  roomNumber: z.number().min(1).max(4),
});

// Statistiques et données
router.get('/stats', adminController.getStats);
router.get('/registrations', adminController.getRegistrations);
router.get('/teams', adminController.getAllTeams);
router.get('/scores', adminController.getScores);
router.get('/export/csv', adminController.exportCSV);

// Gestion des salles
router.post('/rooms/assign', validate(assignRoomsSchema), adminController.assignRooms);
router.get('/rooms/names', adminController.getRoomNames);
router.post('/rooms/names', adminController.updateRoomName);
router.post('/rooms', adminController.addRoom);
router.delete('/rooms/:roomNumber', adminController.deleteRoom);

// Gestion des utilisateurs et équipes
router.put('/users/:userId', adminController.updateUser);
router.delete('/teams/:teamId', adminController.deleteTeam);

// CTFd integration
router.post('/ctfd/sync-scores', ctfdController.syncScores);
router.get('/ctfd/health', ctfdController.healthCheck);
router.get('/ctfd/scoreboard', ctfdController.getScoreboard);

export default router;

