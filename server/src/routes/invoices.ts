import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addInvoicePayment,
  createInvoice,
  deleteInvoice,
  getInvoicePdf,
  getInvoiceById,
  getInvoices,
  markInvoiceSent,
  updateInvoice,
} from '../controllers/invoiceController.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']), createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']), updateInvoice);
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), deleteInvoice);

router.post('/:invoiceId/payments', requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']), addInvoicePayment);
router.post('/:id/send', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']), markInvoiceSent);
router.get('/:id/pdf', getInvoicePdf);

export default router;
