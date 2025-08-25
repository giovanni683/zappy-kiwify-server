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

router.get('/accounts', listAccounts);
router.post('/accounts', createAccount);
router.post('/integrations', createIntegration);
router.get('/integrations', listIntegrations);
router.post('/notification-rules', createNotificationRule);
router.get('/notification-rules', listNotificationRules);
router.get('/connections', async (req, res) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    const { url, token } = await getZappyCredentials(accountId);
    if (!url || !token) {
      return res.status(400).json({ error: 'Zappy credentials not found.' });
    }
    const zdk = new Zdk(url, token);
    const result = await zdk.connections.list();
    if ('error' in result) {
      return res.status(500).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error('Error listing Zappy connections:', error);
    res.status(500).json({ error: 'Error listing Zappy connections.' });
  }
});

router.get('/queues', async (req, res) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    const { url, token } = await getZappyCredentials(accountId);
    if (!url || !token) {
      return res.status(400).json({ error: 'Zappy credentials not found.' });
    }
    const zdk = new Zdk(url, token);
    const result = await zdk.queues.list();
    if ('error' in result) {
      return res.status(500).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    console.error('Error listing Zappy queues:', error);
    res.status(500).json({ error: 'Error listing Zappy queues.' });
  }
});

export default router;