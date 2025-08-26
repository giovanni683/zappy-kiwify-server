
import { Router } from 'express';
import { sendNotificationController } from '../controllers/notificationController';
import {
  getNotificationRulesController,
  updateNotificationRuleStatusController
} from '../controllers/notificationRuleController';
import { createIntegration, listIntegrations } from '../controllers/integrationController';

const router = Router();

// Send notification
router.post('/send', sendNotificationController);

router.get('/notification-rules', getNotificationRulesController);

router.put('/notification-rules/:id/status', updateNotificationRuleStatusController);

router.post('/integrations', createIntegration);

router.get('/integrations', listIntegrations);

export default router;
