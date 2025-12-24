import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMe } from '../controllers/meController.js';

const router = Router();

router.use(authenticate);
router.get('/', getMe);

export default router;

