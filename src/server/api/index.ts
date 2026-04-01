import { Router } from 'express';
import projectRoutes from './projects';
import epicRoutes from './epics';
import taskRoutes from './tasks';
import userSettingsRoutes from './userSettings';

const router = Router();

router.use('/projects', projectRoutes);
router.use('/epics', epicRoutes);
router.use('/tasks', taskRoutes);
router.use('/user-settings', userSettingsRoutes);

export default router;
