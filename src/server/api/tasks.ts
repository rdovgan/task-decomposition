import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { validate } from '../middleware/validation';
import { createTaskSchema, updateTaskSchema } from '../lib/validations';

const router = Router();

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Task dependencies
router.get('/:id/dependencies', taskController.getTaskDependencies);
router.post('/:id/dependencies', taskController.createDependency);

export default router;
