import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  createChangeOrder,
  deleteChangeOrder,
  getChangeOrders,
  updateChangeOrder,
} from '../controllers/changeOrderController.js';

const router = Router();

router.use(authenticate);

router.get('/', getChangeOrders);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), createChangeOrder);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), updateChangeOrder);
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), deleteChangeOrder);

export default router;

