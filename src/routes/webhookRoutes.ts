import { Router } from 'express';
import { handleWebhook, handleKiwifyWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/', handleWebhook);
router.post('/kiwify/:accountId', handleKiwifyWebhook);
router.post('/kiwify', handleKiwifyWebhook);

export default router;
