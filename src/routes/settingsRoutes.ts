import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

/**
 * @swagger
 * /api/zappy/settings:
 *   get:
 *     summary: Retorna configurações do sistema
 *     tags: [Zappy]
 *     responses:
 *       200:
 *         description: Configurações atuais
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 param:
 *                   type: string
 *   put:
 *     summary: Atualiza configurações do sistema
 *     tags: [Zappy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               param:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configurações atualizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updated:
 *                   type: object
 */
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
