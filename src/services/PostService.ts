import { PostModel } from '../models/PostModel';
import { CategoryModel } from '../models/CategoryModel';
import { TagModel } from '../models/TagModel';
import { CreatePostDto, UpdatePostDto, PaginationInfo } from '../types';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { slugify } from '../utils/slug';

export class PostService {
  static async list(params: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published';
    tag?: string;
    q?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const { posts, total } = await PostModel.list({
      page,
      limit,
      status: params.status,
      tag: params.tag,
      q: params.q,
    });
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return { posts, pagination };
  }

  static async getById(id: number) {
    const post = await PostModel.getById(id);
    if (!post) throw new NotFoundError('文章不存在');
    return post;
  }

  static async create(dto: CreatePostDto) {
    if (dto.category_id !== undefined) {
      const categoryExists = await CategoryModel.exists(dto.category_id);
      if (!categoryExists) throw new ValidationError('分类ID无效');
    }

    if (dto.tag_ids && dto.tag_ids.length > 0) {
      const existingTagIds = await TagModel.existsMany(dto.tag_ids);
      if (existingTagIds.length !== dto.tag_ids.length) {
        const invalidIds = dto.tag_ids.filter((id) => !existingTagIds.includes(id));
        throw new ValidationError(`无效的标签ID: ${invalidIds.join(', ')}`);
      }
    }

    let slug = dto.slug || slugify(dto.title);
    if (!slug) slug = `post-${Date.now()}`;
    if (await PostModel.slugExists(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    return PostModel.create({
      ...dto,
      slug,
    });
  }

  static async update(id: number, dto: UpdatePostDto) {
    const existing = await PostModel.getById(id);
    if (!existing) throw new NotFoundError('文章不存在');

    if (dto.category_id !== undefined) {
      const categoryExists = await CategoryModel.exists(dto.category_id);
      if (!categoryExists) throw new ValidationError('分类ID无效');
    }

    if (dto.tag_ids !== undefined && dto.tag_ids.length > 0) {
      const existingTagIds = await TagModel.existsMany(dto.tag_ids);
      if (existingTagIds.length !== dto.tag_ids.length) {
        const invalidIds = dto.tag_ids.filter((tid) => !existingTagIds.includes(tid));
        throw new ValidationError(`无效的标签ID: ${invalidIds.join(', ')}`);
      }
    }

    let finalDto = { ...dto };
    if (dto.slug || dto.title) {
      let slug = dto.slug;
      if (!slug && dto.title) slug = slugify(dto.title);
      if (slug && slug !== existing.slug) {
        if (await PostModel.slugExists(slug, id)) {
          throw new ConflictError('slug已被使用');
        }
        finalDto.slug = slug;
      }
    }

    const updated = await PostModel.update(id, finalDto);
    if (!updated) throw new NotFoundError('文章不存在');
    return updated;
  }

  static async delete(id: number) {
    const success = await PostModel.softDelete(id);
    if (!success) throw new NotFoundError('文章不存在');
    return true;
  }
}
