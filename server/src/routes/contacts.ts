import { Router } from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all contact routes
router.use(authenticate);

router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER']), createContact);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), updateContact);
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), deleteContact);

export default router;
