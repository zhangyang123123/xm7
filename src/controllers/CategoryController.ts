import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/CategoryService';
import { success, noContent } from '../utils/response';
import { CreateCategoryDto, UpdateCategoryDto } from '../types';

export class CategoryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.list();
      return success(res, categories);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await CategoryService.getById(id);
      return success(res, category);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateCategoryDto;
      const category = await CategoryService.create(dto);
      return success(res, category, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const dto = req.body as UpdateCategoryDto;
      const category = await CategoryService.update(id, dto);
      return success(res, category);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await CategoryService.delete(id);
      return noContent(res);
    } catch (err) {
      next(err);
    }
  }
}
