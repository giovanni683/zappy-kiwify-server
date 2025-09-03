import { Router } from 'express';
import { handleWebhook } from '../controllers/webhookController';

const router = Router();
router.post('/', handleWebhook);

// Rota específica para o webhook do Kiwify
import { handleKiwifyWebhook } from '../controllers/webhookController';
router.post('/kiwify/:accountId', handleKiwifyWebhook); // <-- Adiciona rota com parâmetro
router.post('/kiwify', handleKiwifyWebhook); // Mantém compatibilidade

export default router;
