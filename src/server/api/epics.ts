import { Router } from 'express';
import * as epicController from '../controllers/epicController';
import { validate, validateQuery } from '../middleware/validation';
import { createEpicSchema, updateEpicSchema, epicFilterSchema } from '../lib/validations';

const router = Router();

router.get('/', validateQuery(epicFilterSchema), epicController.getEpics);
router.get('/:id', epicController.getEpicById);
router.post('/', validate(createEpicSchema), epicController.createEpic);
router.patch('/:id', validate(updateEpicSchema), epicController.updateEpic);
router.delete('/:id', epicController.deleteEpic);
router.post('/:id/ai-decompose', epicController.aiDecomposeEpic);

export default router;
