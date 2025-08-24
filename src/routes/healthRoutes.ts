import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';

const router = Router();

/**
 * @swagger
 * /api/zappy/health:
 *   get:
 *     summary: Health check do serviço
 *     tags: [Zappy]
 *     responses:
 *       200:
 *         description: Status do serviço
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', healthCheck);

export default router;
