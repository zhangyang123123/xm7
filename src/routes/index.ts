import { Router } from 'express';
import postsRouter from './posts';
import categoriesRouter from './categories';
import tagsRouter from './tags';

const router = Router();

router.use('/posts', postsRouter);
router.use('/categories', categoriesRouter);
router.use('/tags', tagsRouter);

export default router;
