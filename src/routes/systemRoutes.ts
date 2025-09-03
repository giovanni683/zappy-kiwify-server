import { Router } from 'express';
import { healthCheck, getStats, getLogs, getLogsFunction, getSupportedEvents, getDynamicVariables } from '../controllers/statusController';

const router = Router();

router.get('/health', healthCheck);
router.get('/stats', getStats);
router.get('/logs', getLogs);
router.get('/logs-function', getLogsFunction);
router.get('/events', getSupportedEvents);
router.get('/variables', getDynamicVariables);

export default router;
