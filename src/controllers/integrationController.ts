import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uuidv7 } from 'uuidv7';


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
  if (!accountId || String(accountId).trim() === '' || !type || String(type).trim() === '' || !credentials ||
      !credentials.client_id || String(credentials.client_id).trim() === '' ||
      !credentials.client_secret || String(credentials.client_secret).trim() === '') {
    return res.status(400).json({ error: 'Os campos accountId, type, credentials.client_id e credentials.client_secret são obrigatórios e não podem ser vazios.' });
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
