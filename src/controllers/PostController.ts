import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/PostService';
import { success, successWithPagination, noContent } from '../utils/response';
import { CreatePostDto, UpdatePostDto } from '../types';

export class PostController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const status = req.query.status as 'draft' | 'published' | undefined;
      const tag = req.query.tag as string | undefined;
      const q = req.query.q as string | undefined;

      const result = await PostService.list({ page, limit, status, tag, q });
      return successWithPagination(res, result.posts, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const post = await PostService.getById(id);
      return success(res, post);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreatePostDto;
      const post = await PostService.create(dto);
      return success(res, post, 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const dto = req.body as UpdatePostDto;
      const post = await PostService.update(id, dto);
      return success(res, post);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await PostService.delete(id);
      return noContent(res);
    } catch (err) {
      next(err);
    }
  }
}
