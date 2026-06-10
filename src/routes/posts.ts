import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { postValidators } from '../middlewares/validators';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/', postValidators.list, validate, PostController.list);
router.get('/:id', postValidators.getOne, validate, PostController.getById);
router.post('/', postValidators.create, validate, PostController.create);
router.put('/:id', postValidators.update, validate, PostController.update);
router.delete('/:id', postValidators.getOne, validate, PostController.delete);

export default router;
