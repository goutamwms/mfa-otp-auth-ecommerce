import { Tag } from '../entities/ecommerce/Tag';

export interface ITagRepository {
  findById(id: number): Promise<Tag | null>;
  findBySlug(slug: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findOrCreate(names: { en: string; fr: string }): Promise<Tag>;
  create(data: CreateTagInput): Promise<Tag>;
  delete(id: number): Promise<boolean>;
}

export interface CreateTagInput {
  slug: string;
  name: { en: string; fr: string };
}
