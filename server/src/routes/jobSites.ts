import { Router } from 'express';
import {
  getJobSites,
  createJobSite,
  updateJobSite,
  deleteJobSite,
} from '../controllers/jobSiteController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all job site routes
router.use(authenticate);

router.get('/', getJobSites);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), createJobSite);
router.put('/:id', requireRole(['OWNER', 'ADMIN', 'MANAGER']), updateJobSite);
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), deleteJobSite);

export default router;
