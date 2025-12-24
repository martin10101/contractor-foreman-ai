import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addInvoicePayment,
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
} from '../controllers/invoiceController.js';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

router.post('/:invoiceId/payments', addInvoicePayment);

export default router;

