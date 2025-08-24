import { Router } from 'express';
import { getLogs } from '../controllers/logController';

const router = Router();

/**
 * @swagger
 * /api/zappy/logs:
 *   get:
 *     summary: Retorna logs de integração
 *     tags: [Zappy]
 *     responses:
 *       200:
 *         description: Lista de logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/logs', getLogs);

export default router;
