import { Router } from 'express';
import { TagController } from '../controllers/TagController';
import { tagValidators } from '../middlewares/validators';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/', TagController.list);
router.get('/:id', tagValidators.getOne, validate, TagController.getById);
router.post('/', tagValidators.create, validate, TagController.create);
router.put('/:id', tagValidators.update, validate, TagController.update);
router.delete('/:id', tagValidators.getOne, validate, TagController.delete);

export default router;
