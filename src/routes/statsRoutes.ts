import { Router } from 'express';
import { getStats } from '../controllers/statusController';

const router = Router();

router.get('/stats', getStats);

export default router;
