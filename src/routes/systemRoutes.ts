import { Router } from 'express';
import { healthCheck, getStats, getLogs, getLogsFunction } from '../controllers/statusController';

const router = Router();

router.get('/health', healthCheck);
router.get('/stats', getStats);
router.get('/logs', getLogs);
router.get('/logs-function', getLogsFunction);

export default router;
