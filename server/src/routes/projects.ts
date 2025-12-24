import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all project routes
router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER']), createProject);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), updateProject);
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), deleteProject);

export default router;
