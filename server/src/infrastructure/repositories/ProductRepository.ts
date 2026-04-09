import { IProductRepository, CreateProductInput, UpdateProductInput, AddImageInput, ProductColorInput } from '../../domain/interfaces/IProductRepository';
import { Product, ProductListItem, ProductFilters } from '../../domain/entities/ecommerce';
import { database } from '../database';

interface ProductRow {
  id: number;
  slug: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  base_price: string;
  discounted_price: string | null;
  sku: string;
  stock: number;
  is_active: number;
  created_at: Date;
  updated_at: Date | null;
}

interface ProductListRow extends ProductRow {
  image_url: string | null;
  category_names: string | null;
  tag_names: string | null;
}

interface ProductColorRow {
  id: number;
  color_id: number;
  price_modifier: string;
  color_name: { en: string; fr: string };
  color_code: string;
  color_is_active: number;
}

interface ProductImageRow {
  id: number;
  product_id: number;
  color_id: number | null;
  url: string;
  alt_text: string;
  is_primary: number;
  sort_order: number;
  created_at: Date;
}

interface ProductTagRow {
  tag_id: number;
  tag_slug: string;
  tag_name: { en: string; fr: string };
}

export class ProductRepository implements IProductRepository {
  private mapRow(row: ProductRow): Product {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      basePrice: parseFloat(row.base_price),
      discountedPrice: row.discounted_price ? parseFloat(row.discounted_price) : null,
      sku: row.sku,
      stock: row.stock,
      isActive: row.is_active === 1,
      categoryIds: [],
      colorOptions: [],
      images: [],
      tags: [],
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
  }

  private mapListRow(row: ProductListRow): ProductListItem {
    const nameObj = typeof row.name === 'string' ? JSON.parse(row.name) : row.name;
    const finalPrice = row.discounted_price ? parseFloat(row.discounted_price) : parseFloat(row.base_price);
    const basePrice = parseFloat(row.base_price);
    
    return {
      id: row.id,
      slug: row.slug,
      name: nameObj.en || '',
      basePrice,
      discountedPrice: row.discounted_price ? parseFloat(row.discounted_price) : null,
      finalPrice,
      discountPercentage: row.discounted_price 
        ? Math.round(((basePrice - parseFloat(row.discounted_price)) / basePrice) * 100)
        : null,
      sku: row.sku,
      stock: row.stock,
      isActive: row.is_active === 1,
      imageUrl: row.image_url,
      categoryNames: row.category_names ? JSON.parse(row.category_names) : [],
      tagNames: row.tag_names ? JSON.parse(row.tag_names) : [],
      createdAt: new Date(row.created_at),
    };
  }

  async findById(id: number): Promise<Product | null> {
    const row = await database.queryOne<ProductRow>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    if (!row) return null;
    
    const product = this.mapRow(row);
    await this.loadRelations(product);
    return product;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const row = await database.queryOne<ProductRow>(
      'SELECT * FROM products WHERE slug = $1',
      [slug]
    );
    if (!row) return null;
    
    const product = this.mapRow(row);
    await this.loadRelations(product);
    return product;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const row = await database.queryOne<ProductRow>(
      'SELECT * FROM products WHERE sku = $1',
      [sku]
    );
    return row ? this.mapRow(row) : null;
  }

  async findAll(filters?: ProductFilters): Promise<{ products: ProductListItem[]; total: number }> {
    let baseQuery = `SELECT * FROM products WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as count FROM products WHERE 1=1`;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.categoryId) {
      baseQuery += ` AND id IN (SELECT product_id FROM product_categories WHERE category_id = $${paramIndex})`;
      countQuery += ` AND id IN (SELECT product_id FROM product_categories WHERE category_id = $${paramIndex})`;
      params.push(filters.categoryId);
      paramIndex++;
    }

    if (filters?.tagId) {
      baseQuery += ` AND id IN (SELECT product_id FROM product_tags WHERE tag_id = $${paramIndex})`;
      countQuery += ` AND id IN (SELECT product_id FROM product_tags WHERE tag_id = $${paramIndex})`;
      params.push(filters.tagId);
      paramIndex++;
    }

    if (filters?.isActive !== undefined) {
      baseQuery += ` AND is_active = $${paramIndex}`;
      countQuery += ` AND is_active = $${paramIndex}`;
      params.push(filters.isActive ? 1 : 0);
      paramIndex++;
    }

    if (filters?.minPrice !== undefined) {
      baseQuery += ` AND COALESCE(discounted_price, base_price) >= $${paramIndex}`;
      countQuery += ` AND COALESCE(discounted_price, base_price) >= $${paramIndex}`;
      params.push(filters.minPrice);
      paramIndex++;
    }

    if (filters?.maxPrice !== undefined) {
      baseQuery += ` AND COALESCE(discounted_price, base_price) <= $${paramIndex}`;
      countQuery += ` AND COALESCE(discounted_price, base_price) <= $${paramIndex}`;
      params.push(filters.maxPrice);
      paramIndex++;
    }

    if (filters?.search) {
      baseQuery += ` AND (name->>'en' ILIKE $${paramIndex} OR name->>'fr' ILIKE $${paramIndex})`;
      countQuery += ` AND (name->>'en' ILIKE $${paramIndex} OR name->>'fr' ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const countResult = await database.queryOne<{ count: string }>(countQuery, params);
    const total = parseInt(countResult?.count || '0', 10);

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    
    baseQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const rows = await database.query<ProductRow>(baseQuery, params);
    
    const productList: ProductListItem[] = [];
    for (const row of rows) {
      const product = this.mapRow(row);
      const listItem = await this.toListItem(product);
      productList.push(listItem);
    }
    return { products: productList, total };
  }

  private async toListItem(product: Product): Promise<ProductListItem> {
    const primaryImage = await database.queryOne<{ url: string }>(
      'SELECT url FROM product_images WHERE product_id = $1 AND is_primary = 1 LIMIT 1',
      [product.id]
    );
    
    const categoryRows = await database.query<{ name: string }>(
      `SELECT c.name FROM categories c
       JOIN product_categories pc ON pc.category_id = c.id
       WHERE pc.product_id = $1 AND c.is_active = 1`,
      [product.id]
    );
    
    const tagRows = await database.query<{ name: string }>(
      `SELECT t.name FROM tags t
       JOIN product_tags pt ON pt.tag_id = t.id
       WHERE pt.product_id = $1`,
      [product.id]
    );
    
    const lang = 'en';
    const nameObj = typeof product.name === 'string' ? JSON.parse(product.name) : product.name;
    
    return {
      id: product.id,
      slug: product.slug,
      name: nameObj[lang] || nameObj.en || '',
      basePrice: product.basePrice,
      discountedPrice: product.discountedPrice,
      finalPrice: product.discountedPrice ?? product.basePrice,
      discountPercentage: product.discountedPrice 
        ? Math.round(((product.basePrice - product.discountedPrice) / product.basePrice) * 100)
        : null,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
      imageUrl: primaryImage?.url || null,
      categoryNames: categoryRows.map(r => {
        const n = typeof r.name === 'string' ? JSON.parse(r.name) : r.name;
        return n[lang] || n.en || '';
      }),
      tagNames: tagRows.map(r => {
        const n = typeof r.name === 'string' ? JSON.parse(r.name) : r.name;
        return n[lang] || n.en || '';
      }),
      createdAt: product.createdAt,
    };
  }

  private async loadRelations(product: Product): Promise<void> {
    const [categoryIds, colors, images, tags] = await Promise.all([
      database.query<{ category_id: number }>(
        'SELECT category_id FROM product_categories WHERE product_id = $1',
        [product.id]
      ),
      database.query<ProductColorRow>(
        `SELECT pc.id, pc.color_id, pc.price_modifier, c.name as color_name, c.code as color_code, c.is_active as color_is_active
         FROM product_colors pc
         JOIN colors c ON c.id = pc.color_id
         WHERE pc.product_id = $1`,
        [product.id]
      ),
      database.query<ProductImageRow>(
        'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order, id',
        [product.id]
      ),
      database.query<ProductTagRow>(
        `SELECT t.id as tag_id, t.slug as tag_slug, t.name as tag_name
         FROM tags t
         JOIN product_tags pt ON pt.tag_id = t.id
         WHERE pt.product_id = $1`,
        [product.id]
      ),
    ]);

    product.categoryIds = categoryIds.map((c: { category_id: number }) => c.category_id);
    product.colorOptions = colors.map((c: ProductColorRow) => ({
      id: c.id,
      colorId: c.color_id,
      priceModifier: parseFloat(c.price_modifier),
      color: {
        id: c.color_id,
        name: c.color_name,
        code: c.color_code,
        isActive: c.color_is_active === 1,
        createdAt: new Date(),
      },
    }));
    product.images = images.map((i: ProductImageRow) => ({
      id: i.id,
      productId: i.product_id,
      colorId: i.color_id,
      url: i.url,
      altText: i.alt_text,
      isPrimary: i.is_primary === 1,
      sortOrder: i.sort_order,
      createdAt: new Date(i.created_at),
    }));
    product.tags = tags.map((t: ProductTagRow) => ({
      id: t.tag_id,
      slug: t.tag_slug,
      name: t.tag_name,
      createdAt: new Date(),
    }));
  }

  async create(data: CreateProductInput): Promise<Product> {
    const row = await database.queryOne<ProductRow>(
      `INSERT INTO products (slug, name, description, base_price, discounted_price, sku, stock, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.slug,
        JSON.stringify(data.name),
        JSON.stringify(data.description),
        data.basePrice,
        data.discountedPrice || null,
        data.sku,
        data.stock || 0,
        data.isActive !== false ? 1 : 0,
      ]
    );
    
    if (!row) throw new Error('Failed to create product');
    const product = this.mapRow(row);

    if (data.categoryIds?.length) {
      await this.setCategories(product.id, data.categoryIds);
    }

    if (data.colorOptions?.length) {
      await this.setColors(product.id, data.colorOptions);
    }

    if (data.tags?.length) {
      for (const tagName of data.tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        let tag = await database.queryOne<{ id: number }>('SELECT id FROM tags WHERE slug = $1', [slug]);
        if (!tag) {
          tag = await database.queryOne<{ id: number }>(
            'INSERT INTO tags (slug, name) VALUES ($1, $2) RETURNING id',
            [slug, JSON.stringify({ en: tagName, fr: tagName })]
          );
        }
        if (tag) {
          await database.execute(
            'INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [product.id, tag.id]
          );
        }
      }
    }

    if (data.images?.length) {
      await this.addImages(product.id, data.images);
    }

    await this.loadRelations(product);
    return product;
  }

  async update(id: number, data: UpdateProductInput): Promise<Product> {
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
    if (data.basePrice !== undefined) {
      updates.push(`base_price = $${paramIndex++}`);
      values.push(data.basePrice);
    }
    if (data.discountedPrice !== undefined) {
      updates.push(`discounted_price = $${paramIndex++}`);
      values.push(data.discountedPrice);
    }
    if (data.sku !== undefined) {
      updates.push(`sku = $${paramIndex++}`);
      values.push(data.sku);
    }
    if (data.stock !== undefined) {
      updates.push(`stock = $${paramIndex++}`);
      values.push(data.stock);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive ? 1 : 0);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const row = await database.queryOne<ProductRow>(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (!row) throw new Error('Product not found');

    const product = this.mapRow(row);
    await this.loadRelations(product);
    return product;
  }

  async delete(id: number): Promise<boolean> {
    const count = await database.execute('DELETE FROM products WHERE id = $1', [id]);
    return count > 0;
  }

  async addImages(productId: number, images: AddImageInput[]): Promise<any[]> {
    const results = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const row = await database.queryOne<ProductImageRow>(
        `INSERT INTO product_images (product_id, color_id, url, alt_text, is_primary, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [productId, img.colorId || null, img.url, img.altText || '', img.isPrimary ? 1 : 0, img.sortOrder ?? i]
      );
      results.push(row);
    }
    return results;
  }

  async removeImage(imageId: number): Promise<boolean> {
    const count = await database.execute('DELETE FROM product_images WHERE id = $1', [imageId]);
    return count > 0;
  }

  async setPrimaryImage(imageId: number, productId: number): Promise<void> {
    await database.execute('UPDATE product_images SET is_primary = 0 WHERE product_id = $1', [productId]);
    await database.execute('UPDATE product_images SET is_primary = 1 WHERE id = $1', [imageId]);
  }

  async setCategories(productId: number, categoryIds: number[]): Promise<void> {
    await database.execute('DELETE FROM product_categories WHERE product_id = $1', [productId]);
    for (const categoryId of categoryIds) {
      await database.execute(
        'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
        [productId, categoryId]
      );
    }
  }

  async setColors(productId: number, colors: ProductColorInput[]): Promise<void> {
    await database.execute('DELETE FROM product_colors WHERE product_id = $1', [productId]);
    for (const color of colors) {
      await database.execute(
        'INSERT INTO product_colors (product_id, color_id, price_modifier) VALUES ($1, $2, $3)',
        [productId, color.colorId, color.priceModifier || 0]
      );
    }
  }

  async setTags(productId: number, tagIds: number[] | string[], byName = false): Promise<void> {
    await database.execute('DELETE FROM product_tags WHERE product_id = $1', [productId]);
    
    for (const tag of tagIds) {
      if (byName && typeof tag === 'string') {
        const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        let existingTag = await database.queryOne<{ id: number }>('SELECT id FROM tags WHERE slug = $1', [slug]);
        if (!existingTag) {
          existingTag = await database.queryOne<{ id: number }>(
            'INSERT INTO tags (slug, name) VALUES ($1, $2) RETURNING id',
            [slug, JSON.stringify({ en: tag, fr: tag })]
          );
        }
        if (existingTag) {
          await database.execute(
            'INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [productId, existingTag.id]
          );
        }
      } else {
        await database.execute(
          'INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [productId, tag]
        );
      }
    }
  }
}

export const productRepository = new ProductRepository();
