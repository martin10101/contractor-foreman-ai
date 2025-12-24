import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all task routes
router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), createTask);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), updateTask);
router.delete('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), deleteTask);

export default router;
