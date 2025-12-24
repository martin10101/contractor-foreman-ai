import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addEstimateLineItem,
  createEstimate,
  deleteEstimate,
  deleteEstimateLineItem,
  getEstimateById,
  getEstimates,
  updateEstimate,
  updateEstimateLineItem,
} from '../controllers/estimateController.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getEstimates);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER']), createEstimate);
router.get('/:id', getEstimateById);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), updateEstimate);
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), deleteEstimate);

router.post('/:estimateId/line-items', requireRole(['OWNER', 'ADMIN', 'MANAGER']), addEstimateLineItem);
router.put('/:estimateId/line-items/:lineItemId', requireRole(['OWNER', 'ADMIN', 'MANAGER']), updateEstimateLineItem);
router.delete('/:estimateId/line-items/:lineItemId', requireRole(['OWNER', 'ADMIN']), deleteEstimateLineItem);

export default router;
