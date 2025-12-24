import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadSingle } from '../controllers/uploadController.js';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
    const stamp = Date.now().toString(36);
    cb(null, `${stamp}-${safeBase}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.use(authenticate);
router.post('/', requireRole(['OWNER', 'ADMIN', 'MANAGER', 'FOREMAN']), upload.single('file'), uploadSingle);

export default router;
