import { validateDynamicVariables, interpolateMessage } from '../utils/interpolateMessage';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uuidv7 } from 'uuidv7';
import { sendMessageToClient } from '../utils/sendMessageToClient';
import { getKiwifyPayloadAndTemplate } from '../utils/kiwifyPayloads';

// Criar uma conta
export async function createAccount(req: Request, res: Response) {
  const { name, status, ZappyUrl, zappyUrl, zappyToken } = req.body;
  // Aceita tanto 'ZappyUrl' quanto 'zappyUrl' no payload
  const url = ZappyUrl || zappyUrl;
  if (!name || typeof status !== 'number' || String(name).trim() === '' || !url || String(url).trim() === '' || !zappyToken || String(zappyToken).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: name (string), status (number), zappyUrl, zappyToken.' });
  }
  try {
    const id = uuidv7();
    const result = await prisma.account.create({
      data: {
        id,
        name,
        status,
        credentials: {
          zappyUrl: url,
          zappyToken
        }
      }
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
  if (!accountId || type !== 'ZAPPY' || !credentials || !credentials.client_id || !credentials.client_secret || !zappyToken || !zappyUrl ||
      String(accountId).trim() === '' || String(credentials.client_id).trim() === '' || String(credentials.client_secret).trim() === '' || String(zappyToken).trim() === '' || String(zappyUrl).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: accountId, type (deve ser ZAPPY), credentials (client_id, client_secret), zappyToken, zappyUrl.' });
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
        type: 'ZAPPY', 
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
  if (!integrationId || !accountId || typeof active !== 'boolean' || typeof event !== 'string' || !message ||
      String(integrationId).trim() === '' || String(accountId).trim() === '' || String(message).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: integrationId (string), accountId (string), active (boolean), event (number), message (string).' });
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
        adjustments: adjustments || null,
        variables: {}
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
    const rules = await prisma.notificationRule.findMany({
      include: { sector: true }
    });
    res.json(rules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Novo handler para receber webhooks da Kiwify (sem dependência de regra no banco)
export async function kiwifyWebhookHandler(req: Request, res: Response) {
  const eventType = req.body?.event || req.body?.webhook_event_type;
  const accountId = req.body?.account_id;
  const payload = req.body;

  if (!eventType || !accountId) {
    return res.status(400).json({ error: 'Payload inválido.' });
  }

  const { payloads, template } = getKiwifyPayloadAndTemplate(eventType, payload);
  const message = interpolateMessage(template, payloads);

  let statusEnvio = 'success';
  let errorMessage = null;
  try {
    await sendMessageToClient(accountId, message);
  } catch (err: any) {
    statusEnvio = 'error';
    errorMessage = err?.message || String(err);
  }

  // Salva log do disparo
  await prisma.notificationLog.create({
    data: {
      accountId,
      eventType,
      nomeCliente: payloads.nomeCompleto || payloads.primeiroNome || '',
      numeroCliente: payloads.telefone || payloads.numeroCliente || '',
      statusEnvio,
      errorMessage
    }
  });

  res.status(200).json({ success: true, statusEnvio, errorMessage });
}

// Buscar regra de notificação por ID
export async function getNotificationRuleById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const rule = await prisma.notificationRule.findUnique({
      where: { id },
      include: { sector: true }
    });
    console.log('[DEBUG] NotificationRule:', rule); // log para depuração
    if (!rule) {
      return res.status(404).json({ error: 'Notification rule not found.' });
    }
    if (!rule.sector) {
      console.log('[DEBUG] Sector está null para a regra', id);
    } else {
      console.log('[DEBUG] Sector retornado:', rule.sector);
    }
    res.json(rule);
  } catch (error: any) {
    console.error('[ERROR] getNotificationRuleById:', error);
    res.status(500).json({ error: error.message });
  }
}


