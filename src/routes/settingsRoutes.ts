import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
