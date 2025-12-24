import { Router } from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all event routes
router.use(authenticate);

router.get('/', getEvents);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), createEvent);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), updateEvent);
router.delete('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), deleteEvent);

export default router;
