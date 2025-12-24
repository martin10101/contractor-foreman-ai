import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createDocument, deleteDocument, getDocuments } from '../controllers/documentController.js';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), createDocument);
router.delete('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), deleteDocument);

export default router;
