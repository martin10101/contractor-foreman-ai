import { Router } from 'express';
import { getUsers } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Protect all user routes
router.use(authenticate);

router.get('/', getUsers);

export default router;
