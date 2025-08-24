/**
 * @openapi
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         status:
 *           type: number
 *       example:
 *         id: "acc_123"
 *         name: "John Doe"
 *         status: 1
 *     Integration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         accountId:
 *           type: string
 *         type:
 *           type: integer
 *         credentials:
 *           type: object
 *       example:
 *         id: "int_123"
 *         accountId: "acc_123"
 *         type: 1
 *         credentials: { "apiKey": "xyz" }
 *     NotificationRule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         integrationId:
 *           type: string
 *         accountId:
 *           type: string
 *         active:
 *           type: boolean
 *         event:
 *           type: number
 *         message:
 *           type: string
 *         adjustments:
 *           type: object
 *       example:
 *         id: "rule_123"
 *         integrationId: "int_123"
 *         accountId: "acc_123"
 *         active: true
 *         event: 1
 *         message: "Your payment was approved."
 *         adjustments: { "discount": 10 }
 */
import { Router } from 'express';
import { getZappyCredentials } from '../services/zenviaService';
import { Zdk } from 'zdk';
import {
  createAccount,
  listAccounts,
  createIntegration,
  listIntegrations,
  createNotificationRule,
  listNotificationRules
} from '../controllers/zappyController';

const router = Router();

/**
 * @openapi
 * /api/zappy/accounts:
 *   post:
 *     tags:
 *       - Accounts
 *     summary: Create a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 */
router.post('/accounts', createAccount);
/**
 * @openapi
 * /api/zappy/accounts:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: List all accounts
 *     responses:
 *       200:
 *         description: Lista de contas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 */
router.get('/accounts', listAccounts);

/**
 * @openapi
 * /api/zappy/integrations:
 *   post:
 *     tags:
 *       - Integrations
 *     summary: Create a new Zappy/Kiwify integration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *               type:
 *                 type: integer
 *               credentials:
 *                 type: object
 *     responses:
 *       201:
 *         description: Integração criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Integration'
 */
router.post('/integrations', createIntegration);
/**
 * @openapi
 * /api/zappy/integrations:
 *   get:
 *     tags:
 *       - Integrations
 *     summary: List all integrations
 *     responses:
 *       200:
 *         description: Lista de integrações
 */
router.get('/integrations', listIntegrations);

/**
 * @openapi
 * /api/zappy/notification-rules:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Create a new notification rule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Regra criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationRule'
 */
router.post('/notification-rules', createNotificationRule);
/**
 * @openapi
 * /api/zappy/notification-rules:
 *   get:
 *     tags:
 *       - NotificationRules
 *     summary: List all notification rules
 *     responses:
 *       200:
 *         description: Lista de regras
 */
router.get('/notification-rules', listNotificationRules);

/**
 * @openapi
 * /api/zappy/connections:
 *   get:
 *     tags:
 *       - Connections
 *     summary: List all Zappy connections
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID da conta para buscar credenciais
 *     responses:
 *       200:
 *         description: Lista de conexões
 */
router.get('/connections', async (req, res) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    const { url, token } = await getZappyCredentials(accountId);
    if (!url || !token) {
      return res.status(400).json({ error: 'Credenciais Zappy não encontradas.' });
    }
    const zdk = new Zdk(url, token);
    const result = await zdk.connections.list();
    if ('error' in result) {
      return res.status(500).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error('Erro ao listar conexões Zappy:', error);
    res.status(500).json({ error: 'Erro ao listar conexões Zappy.' });
  }
});

/**
 * @openapi
 * /api/zappy/queues:
 *   get:
 *     tags:
 *       - Queues
 *     summary: List all Zappy queues
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID da conta para buscar credenciais
 *     responses:
 *       200:
 *         description: Lista de setores
 */
router.get('/queues', async (req, res) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    const { url, token } = await getZappyCredentials(accountId);
    if (!url || !token) {
      return res.status(400).json({ error: 'Credenciais Zappy não encontradas.' });
    }
    const zdk = new Zdk(url, token);
    const result = await zdk.queues.list();
    if ('error' in result) {
      return res.status(500).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error('Erro ao listar setores Zappy:', error);
    res.status(500).json({ error: 'Erro ao listar setores Zappy.' });
  }
});

export default router;