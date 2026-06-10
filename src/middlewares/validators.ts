import { body, param, query } from 'express-validator';

export const postValidators = {
  create: [
    body('title').isString().notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题不能超过200个字符'),
    body('content').isString().notEmpty().withMessage('内容不能为空'),
    body('slug').optional().isString().isLength({ max: 200 }),
    body('excerpt').optional().isString(),
    body('status').optional().isIn(['draft', 'published']).withMessage('状态必须是 draft 或 published'),
    body('category_id').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    body('tag_ids').optional().isArray().withMessage('标签ID必须是数组'),
    body('tag_ids.*').optional().isInt({ min: 1 }).withMessage('标签ID必须是正整数'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
    body('title').optional().isString().notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题不能超过200个字符'),
    body('content').optional().isString().notEmpty().withMessage('内容不能为空'),
    body('slug').optional().isString().isLength({ max: 200 }),
    body('excerpt').optional().isString(),
    body('status').optional().isIn(['draft', 'published']).withMessage('状态必须是 draft 或 published'),
    body('category_id').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    body('tag_ids').optional().isArray().withMessage('标签ID必须是数组'),
    body('tag_ids.*').optional().isInt({ min: 1 }).withMessage('标签ID必须是正整数'),
  ],
  getOne: [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['draft', 'published']).withMessage('状态必须是 draft 或 published'),
    query('tag').optional().isString(),
    query('q').optional().isString(),
  ],
};

export const categoryValidators = {
  create: [
    body('name').isString().notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
    body('slug').isString().notEmpty().withMessage('slug不能为空').isLength({ max: 100 }).withMessage('slug不能超过100个字符'),
    body('description').optional().isString(),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
    body('name').optional().isString().notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
    body('slug').optional().isString().notEmpty().withMessage('slug不能为空').isLength({ max: 100 }).withMessage('slug不能超过100个字符'),
    body('description').optional().isString(),
  ],
  getOne: [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
  ],
};

export const tagValidators = {
  create: [
    body('name').isString().notEmpty().withMessage('标签名称不能为空').isLength({ max: 50 }).withMessage('标签名称不能超过50个字符'),
    body('slug').isString().notEmpty().withMessage('slug不能为空').isLength({ max: 50 }).withMessage('slug不能超过50个字符'),
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
    body('name').optional().isString().notEmpty().withMessage('标签名称不能为空').isLength({ max: 50 }).withMessage('标签名称不能超过50个字符'),
    body('slug').optional().isString().notEmpty().withMessage('slug不能为空').isLength({ max: 50 }).withMessage('slug不能超过50个字符'),
  ],
  getOne: [
    param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
  ],
};
