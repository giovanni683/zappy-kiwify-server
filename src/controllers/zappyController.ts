
import { Account, Integration, NotificationRule, IntegrationType } from '../models/zappyTypes';
import { validateDynamicVariables } from '../utils/interpolateMessage';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uuidv7 } from 'uuidv7';

// Criar uma conta
export async function createAccount(req: Request, res: Response) {
  const { name, status } = req.body;
  if (!name || typeof status !== 'number') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: name (string), status (number).' });
  }
  try {
    const id = uuidv7();
    const result = await prisma.account.create({
      data: { id, name, status }
    });
    res.status(201).json({ success: true, id: result.id, result });
  } catch (err: any) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar contas
export async function listAccounts(req: Request, res: Response) {
  try {
    const accounts = await prisma.account.findMany();
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar integração
export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials, zappyToken, zappyUrl } = req.body;
  // Validação dos campos obrigatórios
  if (!accountId || typeof type !== 'number' || !credentials || !credentials.client_id || !credentials.client_secret || !zappyToken || !zappyUrl) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: accountId, type, credentials (client_id, client_secret), zappyToken, zappyUrl.' });
  }
  // Verifica se o accountId existe
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return res.status(404).json({ error: 'accountId não encontrado. Crie a conta antes de integrar.' });
  }
  try {
    const id = uuidv7();
    // Salva todos os dados no campo credentials (incluindo zappyToken e zappyUrl)
    const fullCredentials = {
      ...credentials,
      zappyToken,
      zappyUrl
    };
    const result = await prisma.integration.create({
      data: {
        id,
        accountId,
        type,
        credentials: fullCredentials
      }
    });
    res.status(201).json({ success: true, result });
  } catch (err: any) {
    console.error('Erro ao criar integração:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar integrações
export async function listIntegrations(req: Request, res: Response) {
  try {
    const integrations = await prisma.integration.findMany();
    res.json(integrations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar regra de notificação
export async function createNotificationRule(req: Request, res: Response) {
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  if (!integrationId || !accountId || typeof active !== 'boolean' || typeof event !== 'number' || !message) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: integrationId (string), accountId (string), active (boolean), event (number), message (string).' });
  }
  // Validação dos placeholders da mensagem
  const invalidVars = validateDynamicVariables(message);
  if (invalidVars.length > 0) {
    return res.status(400).json({
      error: 'Mensagem contém variáveis dinâmicas inválidas.',
      invalidVariables: invalidVars
    });
  }
  try {
    const id = uuidv7();
    const result = await prisma.notificationRule.create({
      data: {
        id,
        integrationId,
        accountId,
        active,
        event,
        message,
        adjustments: adjustments || null
      }
    });
    res.status(201).json({ success: true, result });
  } catch (err: any) {
    console.error('Erro ao criar regra de notificação:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar regras de notificação
export async function listNotificationRules(req: Request, res: Response) {
  try {
    const rules = await prisma.notificationRule.findMany();
    res.json(rules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
