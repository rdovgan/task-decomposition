import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { validate, validateQuery } from '../middleware/validation';
import { createProjectSchema, updateProjectSchema, projectFilterSchema } from '../lib/validations';

const router = Router();

router.get('/', validateQuery(projectFilterSchema), projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', validate(createProjectSchema), projectController.createProject);
router.patch('/:id', validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;
