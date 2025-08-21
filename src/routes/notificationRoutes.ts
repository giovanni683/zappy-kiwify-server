
import { Router } from 'express';
import { sendNotificationController } from '../controllers/notificationController';

const router = Router();
router.post('/send', sendNotificationController);
import { createIntegration, listIntegrations } from '../controllers/integrationController';
router.post('/integrations', createIntegration);
router.get('/integrations', listIntegrations);

export default router;
