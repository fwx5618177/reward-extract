import { Router } from 'express';
import userRoutes from './userRoutes';
import prizeRoutes from './prizeRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/prizes', prizeRoutes);
router.use('/admin', adminRoutes);

export default router;
