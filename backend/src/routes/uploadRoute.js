import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { UPLOAD_DIR } from '../services/fileService.js';
import { config } from '../config/env.js';
import { handleUpload, handleDeleteUpload } from '../controllers/uploadController.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file,  cb) => {
    const ext    = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `upload-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    config.upload.allowedExtensions.includes(ext)
      ? cb(null, true)
      : cb(new Error(`Invalid file type "${ext}". Allowed: ${config.upload.allowedExtensions.join(', ')}`));
  },
});

const router = Router();
router.post('/',          upload.single('file'), handleUpload);
router.delete('/:fileId', handleDeleteUpload);

export default router;
