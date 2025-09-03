import { Router } from 'express';
import {
  createAccount,
  listAccounts,
  createIntegration,
  listIntegrations,
  createNotificationRuleController,
  getNotificationRulesController,
  kiwifyWebhookHandler,
  listConnectionsController,
  listZappyConnectionsController
} from '../controllers/integrationController';
import { listZappySectors } from '../services/zappyConnections';

const router = Router();

router.post('/accounts', createAccount);
router.get('/accounts', listAccounts);

router.post('/integrations', createIntegration);
router.get('/integrations', listIntegrations);

router.post('/notification-rules', createNotificationRuleController);
router.get('/notification-rules', getNotificationRulesController);

router.post('/webhook/kiwify', kiwifyWebhookHandler);
router.get('/connections', listConnectionsController); // Persistidas no banco
router.get('/connections/active', listZappyConnectionsController); // Ativas via SDK
router.get('/queues', async (req, res) => {
  const { accountId } = req.query;
  try {
    const queues = await listZappySectors(accountId as string);
    res.status(200).json(queues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;