import { Router } from 'express';
import {
  getJobSites,
  createJobSite,
  updateJobSite,
  deleteJobSite,
} from '../controllers/jobSiteController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Protect all job site routes
router.use(authenticate);

router.get('/', getJobSites);
router.post('/', createJobSite);
router.put('/:id', updateJobSite);
router.delete('/:id', deleteJobSite);

export default router;
