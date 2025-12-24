import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { acceptInvite, createInvite, listInvites, revokeInvite } from '../controllers/inviteController.js';

const router = Router();

router.post('/accept', acceptInvite);

router.use(authenticate);

router.get('/', requireRole(['OWNER', 'ADMIN', 'MANAGER']), listInvites);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER']), createInvite);
router.delete('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), revokeInvite);

export default router;

