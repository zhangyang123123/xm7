import { Request, Response, NextFunction } from 'express';
import { TagService } from '../services/TagService';
import { success, noContent } from '../utils/response';
import { CreateTagDto, UpdateTagDto } from '../types';

export class TagController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await TagService.list();
      return success(res, tags);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const tag = await TagService.getById(id);
      return success(res, tag);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateTagDto;
      const tag = await TagService.create(dto);
      return success(res, tag, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const dto = req.body as UpdateTagDto;
      const tag = await TagService.update(id, dto);
      return success(res, tag);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await TagService.delete(id);
      return noContent(res);
    } catch (err) {
      next(err);
    }
  }
}
