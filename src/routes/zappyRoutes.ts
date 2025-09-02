import { Router } from 'express';
import {
  createAccount,
  listAccounts,
  createIntegration,
  listIntegrations,
  createNotificationRuleController,
  getNotificationRulesController,
  kiwifyWebhookHandler
} from '../controllers/integrationController';

const router = Router();

router.post('/accounts', createAccount);
router.get('/accounts', listAccounts);

router.post('/integrations', createIntegration);
router.get('/integrations', listIntegrations);

router.post('/notification-rules', createNotificationRuleController);
router.get('/notification-rules', getNotificationRulesController);

router.post('/webhook/kiwify', kiwifyWebhookHandler);

export default router;