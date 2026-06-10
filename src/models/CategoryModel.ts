import { query } from '../db';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export class CategoryModel {
  static async list(): Promise<Category[]> {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows.map(this.mapRow);
  }

  static async getById(id: number): Promise<Category | null> {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  static async create(dto: CreateCategoryDto): Promise<Category> {
    const sql = `
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(sql, [dto.name, dto.slug, dto.description || null]);
    return this.mapRow(result.rows[0]);
  }

  static async update(id: number, dto: UpdateCategoryDto): Promise<Category | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      params.push(dto.name);
    }
    if (dto.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      params.push(dto.slug);
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      params.push(dto.description);
    }
    if (fields.length === 0) return this.getById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, params);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM categories WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async exists(id: number): Promise<boolean> {
    const result = await query('SELECT id FROM categories WHERE id = $1', [id]);
    return result.rows.length > 0;
  }

  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT id FROM categories WHERE name = $1';
    const params: any[] = [name];
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  static async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT id FROM categories WHERE slug = $1';
    const params: any[] = [slug];
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  private static mapRow(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
