import { Router } from 'express';
import {
  createAccount,
  listAccounts,
  createIntegration,
  listIntegrations,
  createNotificationRule,
  listNotificationRules
} from '../controllers/zappyController';

const router = Router();

// Rotas para Account
router.post('/accounts', createAccount);
router.get('/accounts', listAccounts);

// Rotas para Integration
router.post('/integrations', createIntegration);
router.get('/integrations', listIntegrations);

// Rotas para NotificationRule
router.post('/notification-rules', createNotificationRule);
router.get('/notification-rules', listNotificationRules);

export default router;
