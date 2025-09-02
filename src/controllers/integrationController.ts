import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uuidv7 } from 'uuidv7';
import { sendMessageToClient } from '../utils/sendMessageToClient';
import { interpolateMessage } from '../utils/interpolateMessage';
import { sendNotification } from '../services/notificationService';
import {
  createNotificationRule,
  getNotificationRules,
  updateNotificationRuleStatus,
  deleteNotificationRule
} from '../models/notificationRuleModel';

// Listar integrações (por accountId ou todas)
export async function listIntegrations(req: Request, res: Response) {
  const { accountId } = req.query;
  try {
    const where = accountId ? { accountId: String(accountId) } : {};
    const integrations = await prisma.integration.findMany({ where });
    res.status(200).json(integrations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar integração (ZAPPY)
export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials, zappyToken, zappyUrl } = req.body;
  if (!accountId || String(accountId).trim() === '' || type !== 'ZAPPY' || !credentials ||
      !credentials.client_id || String(credentials.client_id).trim() === '' ||
      !credentials.client_secret || String(credentials.client_secret).trim() === '' ||
      !zappyToken || String(zappyToken).trim() === '' ||
      !zappyUrl || String(zappyUrl).trim() === '') {
    return res.status(400).json({ error: 'Os campos accountId, type (deve ser ZAPPY), credentials.client_id, credentials.client_secret, zappyToken e zappyUrl são obrigatórios e não podem ser vazios.' });
  }
  try {
    const id = uuidv7();
    const fullCredentials = {
      ...credentials,
      zappyToken,
      zappyUrl
    };
    const integration = await prisma.integration.create({
      data: {
        id,
        accountId,
        type: 'ZAPPY',
        credentials: fullCredentials
      }
    });
    res.status(201).json({ success: true, id: integration.id, integration });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar conta (ZAPPY)
export async function createAccount(req: Request, res: Response) {
  const { name, status, ZappyUrl, kiwifyToken } = req.body;
  if (!name || typeof status !== 'number' || String(name).trim() === '' || !ZappyUrl || String(ZappyUrl).trim() === '' || !kiwifyToken || String(kiwifyToken).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: name (string), status (number), ZappyUrl, kiwifyToken.' });
  }
  try {
    const id = uuidv7();
    const result = await prisma.account.create({
      data: {
        id,
        name,
        status,
        credentials: {
          zappyUrl: ZappyUrl,
          kiwifyToken
        }
      }
    });
    res.status(201).json({ success: true, id: result.id, result });
  } catch (err: any) {
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

// Envio de notificação simples
export async function sendNotificationController(req: Request, res: Response) {
  const { title, message } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo title é obrigatório, deve ser string e não pode ser vazio.' });
  }
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'O campo message é obrigatório, deve ser string e não pode ser vazio.' });
  }
  try {
    await sendNotification({ title, message });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// CRUD de regras de notificação
export async function createNotificationRuleController(req: Request, res: Response) {
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  if (!integrationId || String(integrationId).trim() === '' ||
      !accountId || String(accountId).trim() === '' ||
      typeof active !== 'boolean' || event === undefined ||
      !message || String(message).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: integrationId, accountId, active, event, message.' });
  }
  try {
    const id = uuidv7();
    const rule = await createNotificationRule({ id, integrationId, accountId, active, event: Number(event), message, adjustments });
    res.status(201).json({ success: true, rule });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNotificationRulesController(req: Request, res: Response) {
  try {
    const { status } = req.query;
    if (status && status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Invalid status filter.' });
    }
    const rules = await getNotificationRules(status as 'active' | 'inactive');
    res.status(200).json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateNotificationRuleStatusController(req: Request, res: Response) {
  const { id } = req.params;
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'active must be boolean.' });
  }
  try {
    const updated = await updateNotificationRuleStatus(id, active);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Notification rule not found.' });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function deleteNotificationRuleController(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await deleteNotificationRule(id);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Handler de webhook Kiwify (mantido para centralização)
export async function kiwifyWebhookHandler(req: Request, res: Response) {
  const payload = req.body;
  const eventType = payload?.event || payload?.webhook_event_type;
  const accountId = payload?.account_id || payload?.customerId;

  if (!eventType || !accountId) {
    return res.status(400).json({ error: 'Payload inválido.' });
  }

  try {
    // Buscar regra de notificação para o evento
    const rule = await prisma.notificationRule.findFirst({
      where: {
        accountId,
        event: eventType,
        active: true
      }
    });

    // Fallback para variáveis
    let variables: Record<string, any> = (rule && (rule as any).variables) || {};

    // Mapeamento de variáveis dinâmicas do payload (exemplo simplificado)
    if (eventType === 'order.created' || payload.webhook_event_type === 'order.created') {
      variables = {
        ...variables,
        orderId: payload.orderId ?? payload.order_id ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        email: payload.Customer?.email ?? ''
      };
    } else {
      variables = { ...variables, ...payload };
    }

    // Mensagem interpolada
    const template = rule?.message || 'Novo evento recebido!';
    const message = interpolateMessage(template, variables);
    await sendMessageToClient(accountId, message);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Erro ao processar webhook da Kiwify:', err);
    res.status(500).json({ error: err.message });
  }
}

