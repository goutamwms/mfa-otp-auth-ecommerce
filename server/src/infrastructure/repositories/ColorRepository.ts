import { IColorRepository, CreateColorInput, UpdateColorInput } from '../../domain/interfaces/IColorRepository';
import { Color } from '../../domain/entities/ecommerce';
import { database } from '../database';

interface ColorRow {
  id: number;
  name: { en: string; fr: string };
  code: string;
  is_active: number;
  created_at: Date;
}

export class ColorRepository implements IColorRepository {
  private mapRow(row: ColorRow): Color {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
    };
  }

  async findById(id: number): Promise<Color | null> {
    const row = await database.queryOne<ColorRow>(
      'SELECT * FROM colors WHERE id = $1',
      [id]
    );
    return row ? this.mapRow(row) : null;
  }

  async findByCode(code: string): Promise<Color | null> {
    const row = await database.queryOne<ColorRow>(
      'SELECT * FROM colors WHERE code = $1',
      [code]
    );
    return row ? this.mapRow(row) : null;
  }

  async findAll(activeOnly = false): Promise<Color[]> {
    const where = activeOnly ? 'WHERE is_active = 1' : '';
    const rows = await database.query<ColorRow>(
      `SELECT * FROM colors ${where} ORDER BY name`
    );
    return rows.map((row: ColorRow) => this.mapRow(row));
  }

  async create(data: CreateColorInput): Promise<Color> {
    const row = await database.queryOne<ColorRow>(
      `INSERT INTO colors (name, code, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [JSON.stringify(data.name), data.code, data.isActive !== false ? 1 : 0]
    );
    if (!row) throw new Error('Failed to create color');
    return this.mapRow(row);
  }

  async update(id: number, data: UpdateColorInput): Promise<Color> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(JSON.stringify(data.name));
    }
    if (data.code !== undefined) {
      updates.push(`code = $${paramIndex++}`);
      values.push(data.code);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive ? 1 : 0);
    }
    
    values.push(id);

    const row = await database.queryOne<ColorRow>(
      `UPDATE colors SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (!row) throw new Error('Color not found');
    return this.mapRow(row);
  }

  async delete(id: number): Promise<boolean> {
    const count = await database.execute('DELETE FROM colors WHERE id = $1', [id]);
    return count > 0;
  }
}

export const colorRepository = new ColorRepository();
