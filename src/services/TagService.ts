import { TagModel } from '../models/TagModel';
import { CreateTagDto, UpdateTagDto } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';
import { slugify } from '../utils/slug';

export class TagService {
  static async list() {
    return TagModel.list();
  }

  static async getById(id: number) {
    const tag = await TagModel.getById(id);
    if (!tag) throw new NotFoundError('标签不存在');
    return tag;
  }

  static async create(dto: CreateTagDto) {
    if (await TagModel.nameExists(dto.name)) {
      throw new ConflictError('标签名称已存在');
    }

    let slug = dto.slug || slugify(dto.name);
    if (!slug) slug = `tag-${Date.now()}`;
    if (await TagModel.slugExists(slug)) {
      throw new ConflictError('slug已被使用');
    }

    return TagModel.create({
      ...dto,
      slug,
    });
  }

  static async update(id: number, dto: UpdateTagDto) {
    const existing = await TagModel.getById(id);
    if (!existing) throw new NotFoundError('标签不存在');

    if (dto.name && dto.name !== existing.name) {
      if (await TagModel.nameExists(dto.name, id)) {
        throw new ConflictError('标签名称已存在');
      }
    }

    if (dto.slug && dto.slug !== existing.slug) {
      if (await TagModel.slugExists(dto.slug, id)) {
        throw new ConflictError('slug已被使用');
      }
    }

    const updated = await TagModel.update(id, dto);
    if (!updated) throw new NotFoundError('标签不存在');
    return updated;
  }

  static async delete(id: number) {
    const success = await TagModel.delete(id);
    if (!success) throw new NotFoundError('标签不存在');
    return true;
  }
}
