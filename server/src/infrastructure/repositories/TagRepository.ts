import { ITagRepository } from '../../domain/interfaces/ITagRepository';
import { Tag } from '../../domain/entities/ecommerce';
import { database } from '../database';

interface TagRow {
  id: number;
  slug: string;
  name: { en: string; fr: string };
  created_at: Date;
}

export class TagRepository implements ITagRepository {
  private mapRow(row: TagRow): Tag {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      createdAt: new Date(row.created_at),
    };
  }

  async findById(id: number): Promise<Tag | null> {
    const row = await database.queryOne<TagRow>(
      'SELECT * FROM tags WHERE id = $1',
      [id]
    );
    return row ? this.mapRow(row) : null;
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    const row = await database.queryOne<TagRow>(
      'SELECT * FROM tags WHERE slug = $1',
      [slug]
    );
    return row ? this.mapRow(row) : null;
  }

  async findAll(): Promise<Tag[]> {
    const rows = await database.query<TagRow>('SELECT * FROM tags ORDER BY name');
    return rows.map((row: TagRow) => this.mapRow(row));
  }

  async findOrCreate(names: { en: string; fr: string }): Promise<Tag> {
    const slug = names.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    let tag = await this.findBySlug(slug);
    if (tag) return tag;

    return this.create({ slug, name: names });
  }

  async create(data: { slug: string; name: { en: string; fr: string } }): Promise<Tag> {
    const row = await database.queryOne<TagRow>(
      `INSERT INTO tags (slug, name) VALUES ($1, $2) RETURNING *`,
      [data.slug, JSON.stringify(data.name)]
    );
    if (!row) throw new Error('Failed to create tag');
    return this.mapRow(row);
  }

  async delete(id: number): Promise<boolean> {
    const count = await database.execute('DELETE FROM tags WHERE id = $1', [id]);
    return count > 0;
  }
}

export const tagRepository = new TagRepository();
