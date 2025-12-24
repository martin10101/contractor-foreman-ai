import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createDocument, deleteDocument, getDocuments } from '../controllers/documentController.js';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/', createDocument);
router.delete('/:id', deleteDocument);

export default router;

