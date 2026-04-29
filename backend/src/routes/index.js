import { Router } from 'express';
import chatRoute   from './chatRoute.js';
import uploadRoute from './uploadRoute.js';

const router = Router();
router.use('/chat',   chatRoute);
router.use('/upload', uploadRoute);

export default router;
