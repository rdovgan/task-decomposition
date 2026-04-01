import { Router } from 'express';
import * as epicController from '../controllers/epicController';
import { validate } from '../middleware/validation';
import { createEpicSchema, updateEpicSchema } from '../lib/validations';

const router = Router();

router.get('/', epicController.getEpics);
router.get('/:id', epicController.getEpicById);
router.post('/', validate(createEpicSchema), epicController.createEpic);
router.patch('/:id', validate(updateEpicSchema), epicController.updateEpic);
router.delete('/:id', epicController.deleteEpic);

export default router;
