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
  listZappyConnectionsController,
  getNotificationRuleByIdController
} from '../controllers/integrationController';
import { updateNotificationRuleController } from '../controllers/updateNotificationRuleController';
import { listZappySectors } from '../services/zappyConnections';

const router = Router();

router.post('/accounts', createAccount);
router.get('/accounts', listAccounts);

router.post('/integrations', createIntegration);
router.get('/integrations', listIntegrations);

router.post('/notification-rules', createNotificationRuleController);
router.get('/notification-rules', getNotificationRulesController);
router.get('/notification-rules/:id', getNotificationRuleByIdController);
router.patch('/notification-rules/:id', updateNotificationRuleController);

router.post('/webhook/kiwify', kiwifyWebhookHandler);
router.get('/connections', listConnectionsController);
router.get('/connections/active', listZappyConnectionsController);

router.get('/queues', async (req, res) => {
  try {
    const queues = await listZappySectors(req.query.accountId as string);
    res.status(200).json(queues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;