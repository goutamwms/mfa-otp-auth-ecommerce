import { ICategoryRepository, CreateCategoryInput, UpdateCategoryInput } from '../../domain/interfaces/ICategoryRepository';
import { Category, CategoryWithChildren } from '../../domain/entities/ecommerce';
import { database } from '../database';

interface CategoryRow {
  id: number;
  slug: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  image_url: string | null;
  parent_id: number | null;
  is_active: number;
  sort_order: number;
  created_at: Date;
  updated_at: Date | null;
}

export class CategoryRepository implements ICategoryRepository {
  private mapRow(row: CategoryRow): Category {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      parentId: row.parent_id,
      isActive: row.is_active === 1,
      order: row.sort_order,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
  }

  async findById(id: number): Promise<Category | null> {
    const row = await database.queryOne<CategoryRow>(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return row ? this.mapRow(row) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const row = await database.queryOne<CategoryRow>(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    return row ? this.mapRow(row) : null;
  }

  async findAll(activeOnly = false): Promise<Category[]> {
    const where = activeOnly ? 'WHERE is_active = 1' : '';
    const rows = await database.query<CategoryRow>(
      `SELECT * FROM categories ${where} ORDER BY sort_order, id`
    );
    return rows.map((row: CategoryRow) => this.mapRow(row));
  }

  async findWithChildren(): Promise<CategoryWithChildren[]> {
    const rows = await database.query<CategoryRow>(
      'SELECT * FROM categories ORDER BY sort_order, id'
    );
    const categories = rows.map((row: CategoryRow) => this.mapRow(row));
    
    const rootCategories = categories.filter(c => !c.parentId);
    const attachChildren = (parent: Category): CategoryWithChildren => {
      const withChildren: CategoryWithChildren = { ...parent, children: [] };
      withChildren.children = categories
        .filter(c => c.parentId === parent.id)
        .map(c => attachChildren(c));
      return withChildren;
    };
    
    return rootCategories.map(c => attachChildren(c));
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    const row = await database.queryOne<CategoryRow>(
      `INSERT INTO categories (slug, name, description, image_url, parent_id, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.slug,
        JSON.stringify(data.name),
        JSON.stringify(data.description),
        data.imageUrl || null,
        data.parentId || null,
        data.isActive !== false ? 1 : 0,
        data.order || 0,
      ]
    );
    if (!row) throw new Error('Failed to create category');
    return this.mapRow(row);
  }

  async update(id: number, data: UpdateCategoryInput): Promise<Category> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      values.push(data.slug);
    }
    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(JSON.stringify(data.name));
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(JSON.stringify(data.description));
    }
    if (data.imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(data.imageUrl);
    }
    if (data.parentId !== undefined) {
      updates.push(`parent_id = $${paramIndex++}`);
      values.push(data.parentId);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive ? 1 : 0);
    }
    if (data.order !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(data.order);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const row = await database.queryOne<CategoryRow>(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (!row) throw new Error('Category not found');
    return this.mapRow(row);
  }

  async delete(id: number): Promise<boolean> {
    const count = await database.execute('DELETE FROM categories WHERE id = $1', [id]);
    return count > 0;
  }

  async reorder(id: number, order: number): Promise<void> {
    await database.execute(
      'UPDATE categories SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [order, id]
    );
  }
}

export const categoryRepository = new CategoryRepository();
