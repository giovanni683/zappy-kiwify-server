// ...existing code...

import { Router } from 'express';
import {
  createAccount,
  listAccounts,
  createIntegration,
  listIntegrations,
  createNotificationRule,
  listNotificationRules,
  kiwifyWebhookHandler
} from '../controllers/zappyController';

import { prisma } from '../config/prisma';
import { Zdk } from 'zdk';

const router = Router();

// Função utilitária para validar URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Função utilitária para validar credenciais
function isValidCredentials(creds: any): boolean {
  return (
    creds &&
    typeof creds.zappyToken === 'string' && creds.zappyToken.trim() !== '' &&
    typeof creds.zappyUrl === 'string' && creds.zappyUrl.trim() !== '' &&
    isValidUrl(creds.zappyUrl)
  );
}

// Endpoint para listar setores Zappy por accountId
router.get('/sectors', async (req, res) => {
  const { accountId } = req.query;
  if (!accountId || String(accountId).trim() === '') {
    return res.status(400).json({ error: 'accountId é obrigatório.' });
  }
  try {
    const connections = await prisma.integration.findMany({
      where: {
        accountId: String(accountId),
        type: 'ZAPPY'
      },
      select: {
        id: true,
        credentials: true
      }
    });
    const activeConnections = connections.filter(conn => isValidCredentials(conn.credentials));
    const results = [];
    for (const conn of activeConnections) {
      const creds = conn.credentials as any;
      try {
        const zdk = new Zdk(creds.zappyToken, creds.zappyUrl);
        const zappySectors = await zdk.queues.list();
        results.push({
          id: conn.id,
          credentials: creds,
          zappySectors,
          error: null
        });
      } catch (zdkErr) {
        results.push({
          id: conn.id,
          credentials: creds,
          zappySectors: [],
          error: (zdkErr as any).message || String(zdkErr)
        });
      }
    }
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});

// Endpoint para criar conta, aceitando zappyToken para Zappy
router.post('/accounts', async (req, res) => {
  const { name, status, zappyUrl, zappyToken } = req.body;
  // Validação dos campos obrigatórios
  if (!name || typeof name !== 'string' || name.trim() === '' ||
    typeof status !== 'number' ||
    !zappyUrl || typeof zappyUrl !== 'string' || zappyUrl.trim() === '' ||
    !zappyToken || typeof zappyToken !== 'string' || zappyToken.trim() === '') {
    return res.status(400).json({
      error: 'Campos obrigatórios ausentes ou vazios: name (string), status (number), zappyUrl, zappyToken.'
    });
  }
  try {
    // Criação da conta no banco
    const account = await prisma.account.create({
      data: {
        name,
        status,
        credentials: {
          zappyUrl,
          zappyToken
        }
      }
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: (err as any).message });
  }
});
router.get('/accounts', listAccounts);

router.post('/integrations', createIntegration);
router.get('/integrations', listIntegrations);

router.post('/notification-rules', createNotificationRule);
router.get('/notification-rules', listNotificationRules);

router.post('/webhook/kiwify', kiwifyWebhookHandler);

// Endpoint para listar conexões Zappy por accountId
router.get('/connections', async (req, res) => {
  const { accountId } = req.query;

  console.log('Query accountId:', accountId);

  if (!accountId || String(accountId).trim() === '') {
    return res.status(400).json({ error: 'accountId é obrigatório.' });
  }

  try {
    const integration = await prisma.integration.findFirst({
      where: {
        accountId: String(accountId),
        type: 'ZAPPY'
      },
      select: {
        id: true,
        credentials: true
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integração Zappy não encontrada para o accountId fornecido.' });
    }

    console.log('Found integration:', integration);

    const { credentials }: Record<string, any> = integration;
    const zdk = new Zdk(credentials?.zappyUrl, credentials?.zappyToken);
    const zappyConnections = await zdk.connections.list();

    if ("error" in credentials) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    return res.status(200).json(zappyConnections);

  } catch (err) {
    console.error('Erro ao listar conexões Zappy:', err);
    res.status(500).json({ error: (err as any).message });
  }
});


export default router;