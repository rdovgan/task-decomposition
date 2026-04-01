import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { validate, validateQuery } from '../middleware/validation';
import {
  createTaskSchema,
  updateTaskSchema,
  createDependencySchema,
  createCommentSchema,
  updateCommentSchema,
  createTaskLinkSchema,
  updateTaskLinkSchema,
  taskFilterSchema,
} from '../lib/validations';

const router = Router();

// AI-powered task decomposition health check (must be before /:id routes)
router.get('/decompose/health', taskController.decomposeHealthCheck);

// Task CRUD endpoints
router.get('/', validateQuery(taskFilterSchema), taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Task dependencies
router.get('/:id/dependencies', taskController.getTaskDependencies);
router.post('/:id/dependencies', validate(createDependencySchema), taskController.createDependency);
router.delete('/dependencies/:depId', taskController.deleteDependency);

// Task comments
router.get('/:id/comments', taskController.getComments);
router.post('/:id/comments', validate(createCommentSchema), taskController.createComment);

// Task links
router.get('/:id/links', taskController.getLinks);
router.post('/:id/links', validate(createTaskLinkSchema), taskController.createLink);

// Comment and link specific endpoints (need to be after the nested routes)
router.patch('/comments/:id', validate(updateCommentSchema), taskController.updateComment);
router.delete('/comments/:id', taskController.deleteComment);
router.patch('/links/:id', validate(updateTaskLinkSchema), taskController.updateLink);
router.delete('/links/:id', taskController.deleteLink);

// AI-powered task decomposition
router.post('/:id/decompose', taskController.decomposeTask);

export default router;