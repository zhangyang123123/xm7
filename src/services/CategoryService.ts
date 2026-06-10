import { CategoryModel } from '../models/CategoryModel';
import { CreateCategoryDto, UpdateCategoryDto } from '../types';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { slugify } from '../utils/slug';

export class CategoryService {
  static async list() {
    return CategoryModel.list();
  }

  static async getById(id: number) {
    const category = await CategoryModel.getById(id);
    if (!category) throw new NotFoundError('分类不存在');
    return category;
  }

  static async create(dto: CreateCategoryDto) {
    if (await CategoryModel.nameExists(dto.name)) {
      throw new ConflictError('分类名称已存在');
    }

    let slug = dto.slug || slugify(dto.name);
    if (!slug) slug = `category-${Date.now()}`;
    if (await CategoryModel.slugExists(slug)) {
      throw new ConflictError('slug已被使用');
    }

    return CategoryModel.create({
      ...dto,
      slug,
    });
  }

  static async update(id: number, dto: UpdateCategoryDto) {
    const existing = await CategoryModel.getById(id);
    if (!existing) throw new NotFoundError('分类不存在');

    if (dto.name && dto.name !== existing.name) {
      if (await CategoryModel.nameExists(dto.name, id)) {
        throw new ConflictError('分类名称已存在');
      }
    }

    if (dto.slug && dto.slug !== existing.slug) {
      if (await CategoryModel.slugExists(dto.slug, id)) {
        throw new ConflictError('slug已被使用');
      }
    }

    const updated = await CategoryModel.update(id, dto);
    if (!updated) throw new NotFoundError('分类不存在');
    return updated;
  }

  static async delete(id: number) {
    const success = await CategoryModel.delete(id);
    if (!success) throw new NotFoundError('分类不存在');
    return true;
  }
}
