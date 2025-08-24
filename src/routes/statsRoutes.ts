import { Router } from 'express';
import { getStats } from '../controllers/statsController';

const router = Router();

/**
 * @swagger
 * /api/zappy/stats:
 *   get:
 *     summary: Retorna estatísticas do sistema
 *     tags: [Zappy]
 *     responses:
 *       200:
 *         description: Estatísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notificationsSent:
 *                   type: integer
 *                 integrationsActive:
 *                   type: integer
 */
router.get('/stats', getStats);

export default router;
