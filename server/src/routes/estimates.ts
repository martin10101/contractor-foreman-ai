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

const router = Router();

router.use(authenticate);

router.get('/', getEstimates);
router.post('/', createEstimate);
router.get('/:id', getEstimateById);
router.put('/:id', updateEstimate);
router.delete('/:id', deleteEstimate);

router.post('/:estimateId/line-items', addEstimateLineItem);
router.put('/:estimateId/line-items/:lineItemId', updateEstimateLineItem);
router.delete('/:estimateId/line-items/:lineItemId', deleteEstimateLineItem);

export default router;

