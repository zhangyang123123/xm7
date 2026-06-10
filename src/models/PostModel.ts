import { query } from '../db';
import { Post, CreatePostDto, UpdatePostDto, Tag } from '../types';

interface ListPostsOptions {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  tag?: string;
  q?: string;
}

export class PostModel {
  static async list(options: ListPostsOptions = {}) {
    const { page = 1, limit = 10, status, tag, q } = options;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['p.is_deleted = FALSE'];
    const params: any[] = [];
    let paramIdx = 1;

    if (status) {
      conditions.push(`p.status = $${paramIdx++}`);
      params.push(status);
    }
    if (q) {
      conditions.push(`(p.title ILIKE $${paramIdx++} OR p.content ILIKE $${paramIdx++})`);
      params.push(`%${q}%`, `%${q}%`);
    }

    let joinClause = '';
    if (tag) {
      joinClause = `
        INNER JOIN post_tags pt ON p.id = pt.post_id
        INNER JOIN tags t ON pt.tag_id = t.id
      `;
      conditions.push(`t.slug = $${paramIdx++}`);
      params.push(tag);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      ${joinClause}
      ${whereClause}
    `;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const sql = `
      SELECT DISTINCT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.description as cat_description, c.created_at as cat_created_at, c.updated_at as cat_updated_at
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinClause}
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    params.push(limit, offset);
    const result = await query(sql, params);

    const posts: Post[] = result.rows.map((row) => this.mapPostRow(row));

    if (posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const tagsMap = await this.getTagsForPosts(postIds);
      posts.forEach((post) => {
        post.tags = tagsMap.get(post.id) || [];
      });
    }

    return { posts, total, page, limit };
  }

  static async getById(id: number): Promise<Post | null> {
    const sql = `
      SELECT p.*, c.id as cat_id, c.name as cat_name, c.slug as cat_slug, c.description as cat_description, c.created_at as cat_created_at, c.updated_at as cat_updated_at
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_deleted = FALSE
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) return null;

    const post = this.mapPostRow(result.rows[0]);
    const tagsMap = await this.getTagsForPosts([post.id]);
    post.tags = tagsMap.get(post.id) || [];
    return post;
  }

  static async create(dto: CreatePostDto): Promise<Post> {
    const sql = `
      INSERT INTO posts (title, slug, content, excerpt, status, category_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(sql, [
      dto.title,
      dto.slug,
      dto.content,
      dto.excerpt || null,
      dto.status || 'draft',
      dto.category_id || null,
    ]);
    const post = result.rows[0];

    if (dto.tag_ids && dto.tag_ids.length > 0) {
      await this.setPostTags(post.id, dto.tag_ids);
    }

    return this.getById(post.id) as Promise<Post>;
  }

  static async update(id: number, dto: UpdatePostDto): Promise<Post | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (dto.title !== undefined) {
      fields.push(`title = $${idx++}`);
      params.push(dto.title);
    }
    if (dto.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      params.push(dto.slug);
    }
    if (dto.content !== undefined) {
      fields.push(`content = $${idx++}`);
      params.push(dto.content);
    }
    if (dto.excerpt !== undefined) {
      fields.push(`excerpt = $${idx++}`);
      params.push(dto.excerpt);
    }
    if (dto.status !== undefined) {
      fields.push(`status = $${idx++}`);
      params.push(dto.status);
    }
    if (dto.category_id !== undefined) {
      fields.push(`category_id = $${idx++}`);
      params.push(dto.category_id);
    }
    if (fields.length === 0 && !dto.tag_ids) return this.getById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    if (fields.length > 1) {
      const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = FALSE`;
      await query(sql, params);
    }

    if (dto.tag_ids !== undefined) {
      await this.setPostTags(id, dto.tag_ids);
    }

    return this.getById(id);
  }

  static async softDelete(id: number): Promise<boolean> {
    const sql = `
      UPDATE posts
      SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_deleted = FALSE
    `;
    const result = await query(sql, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT id FROM posts WHERE slug = $1 AND is_deleted = FALSE';
    const params: any[] = [slug];
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  private static async setPostTags(postId: number, tagIds: number[]) {
    await query('DELETE FROM post_tags WHERE post_id = $1', [postId]);
    if (tagIds.length === 0) return;
    const uniqueTagIds = [...new Set(tagIds)];
    const values = uniqueTagIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    const sql = `INSERT INTO post_tags (post_id, tag_id) VALUES ${values}`;
    await query(sql, [postId, ...uniqueTagIds]);
  }

  private static async getTagsForPosts(postIds: number[]): Promise<Map<number, Tag[]>> {
    const sql = `
      SELECT pt.post_id, t.*
      FROM post_tags pt
      INNER JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = ANY($1)
      ORDER BY t.name
    `;
    const result = await query(sql, [postIds]);
    const map = new Map<number, Tag[]>();
    for (const row of result.rows) {
      const tags = map.get(row.post_id) || [];
      tags.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
      map.set(row.post_id, tags);
    }
    return map;
  }

  private static mapPostRow(row: any): Post {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      excerpt: row.excerpt,
      status: row.status,
      category_id: row.category_id,
      category: row.cat_id
        ? {
            id: row.cat_id,
            name: row.cat_name,
            slug: row.cat_slug,
            description: row.cat_description,
            created_at: row.cat_created_at,
            updated_at: row.cat_updated_at,
          }
        : null,
      is_deleted: row.is_deleted,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
