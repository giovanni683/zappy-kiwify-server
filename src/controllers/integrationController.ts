import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/zappy/integrations:
 *   get:
 *     summary: Lista integrações por accountId
 *     tags: [Integrations]
 *     parameters:
 *       - in: query
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conta
 *     responses:
 *       200:
 *         description: Lista de integrações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Integration'
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno
 */
export async function listIntegrations(req: Request, res: Response) {
  const { accountId } = req.query;
  if (!accountId) {
    return res.status(400).json({ error: 'O campo accountId é obrigatório.' });
  }
  try {
    const integrations = await prisma.integration.findMany({
      where: { accountId: String(accountId) }
    });
    res.status(200).json(integrations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/zappy/integrations:
 *   post:
 *     summary: Cria uma integração
 *     tags: [Integrations]
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
 *             required:
 *               - accountId
 *               - type
 *               - credentials
 *           example:
 *             accountId: "abc123"
 *             type: 1
 *             credentials: { "token": "xyz" }
 *     responses:
 *       201:
 *         description: Integração criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno
 */
export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials } = req.body;
  if (!accountId || !type || !credentials) {
    return res.status(400).json({ error: 'Os campos accountId, type e credentials são obrigatórios.' });
  }
  try {
    const integration = await prisma.integration.create({
      data: {
        accountId,
        type: Number(type),
        credentials
      }
    });
    res.status(201).json({ success: true, id: integration.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
