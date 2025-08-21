import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET /integrations?accountId=xxx
export async function listIntegrations(req: Request, res: Response) {
  const { accountId } = req.query;
  if (!accountId) {
    return res.status(400).json({ error: 'accountId é obrigatório.' });
  }
  try {
    const integrations = await prisma.integration.findMany({
      where: { accountId: String(accountId) }
    });
    res.status(200).json(integrations);
  } catch (err: any) {
    console.error('Erro ao listar integrações:', err);
    res.status(500).json({ error: err.message });
  }
}

// POST /integrations
export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials } = req.body;
  if (!accountId || !type || !credentials) {
    return res.status(400).json({ error: 'accountId, type e credentials são obrigatórios.' });
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
    console.error('Erro ao criar integração:', err);
    res.status(500).json({ error: err.message });
  }
}
