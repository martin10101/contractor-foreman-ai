import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getOverviewReport } from '../controllers/reportController.js';

const router = Router();

router.use(authenticate);

router.get('/overview', getOverviewReport);

export default router;

