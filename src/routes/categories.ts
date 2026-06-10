import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { categoryValidators } from '../middlewares/validators';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/', CategoryController.list);
router.get('/:id', categoryValidators.getOne, validate, CategoryController.getById);
router.post('/', categoryValidators.create, validate, CategoryController.create);
router.put('/:id', categoryValidators.update, validate, CategoryController.update);
router.delete('/:id', categoryValidators.getOne, validate, CategoryController.delete);

export default router;
