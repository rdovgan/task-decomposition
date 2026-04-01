import { Router } from 'express';
import projectRoutes from './projects';
import epicRoutes from './epics';
import taskRoutes from './tasks';

const router = Router();

router.use('/projects', projectRoutes);
router.use('/epics', epicRoutes);
router.use('/tasks', taskRoutes);

export default router;
