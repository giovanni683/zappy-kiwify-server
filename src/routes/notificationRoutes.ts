
import { Router } from 'express';
import { sendNotificationController } from '../controllers/notificationController';

const router = Router();
router.post('/send', sendNotificationController);

export default router;
