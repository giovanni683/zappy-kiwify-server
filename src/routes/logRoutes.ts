import { Router } from 'express';
import { getLogs } from '../controllers/logController';

const router = Router();

router.get('/logs', getLogs);

export default router;
