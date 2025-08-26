import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uuidv7 } from 'uuidv7';
const prisma = new PrismaClient();


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


export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials } = req.body;
  if (!accountId || !type || !credentials) {
    return res.status(400).json({ error: 'Os campos accountId, type e credentials são obrigatórios.' });
  }
  try {
    const id = uuidv7();
    const integration = await prisma.integration.create({
      data: {
        id,
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
