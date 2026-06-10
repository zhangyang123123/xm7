import { query } from '../db';
import { Tag, CreateTagDto, UpdateTagDto } from '../types';

export class TagModel {
  static async list(): Promise<Tag[]> {
    const result = await query('SELECT * FROM tags ORDER BY name ASC');
    return result.rows.map(this.mapRow);
  }

  static async getById(id: number): Promise<Tag | null> {
    const result = await query('SELECT * FROM tags WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  static async create(dto: CreateTagDto): Promise<Tag> {
    const sql = `
      INSERT INTO tags (name, slug)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await query(sql, [dto.name, dto.slug]);
    return this.mapRow(result.rows[0]);
  }

  static async update(id: number, dto: UpdateTagDto): Promise<Tag | null> {
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
    if (fields.length === 0) return this.getById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE tags SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, params);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM tags WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async existsMany(ids: number[]): Promise<number[]> {
    if (ids.length === 0) return [];
    const result = await query('SELECT id FROM tags WHERE id = ANY($1)', [ids]);
    return result.rows.map((r) => r.id);
  }

  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT id FROM tags WHERE name = $1';
    const params: any[] = [name];
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  static async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT id FROM tags WHERE slug = $1';
    const params: any[] = [slug];
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  private static mapRow(row: any): Tag {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
