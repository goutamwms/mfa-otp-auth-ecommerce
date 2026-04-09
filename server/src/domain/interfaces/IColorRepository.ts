import { Color } from '../entities/ecommerce/Color';

export interface IColorRepository {
  findById(id: number): Promise<Color | null>;
  findByCode(code: string): Promise<Color | null>;
  findAll(activeOnly?: boolean): Promise<Color[]>;
  create(data: CreateColorInput): Promise<Color>;
  update(id: number, data: UpdateColorInput): Promise<Color>;
  delete(id: number): Promise<boolean>;
}

export interface CreateColorInput {
  name: { en: string; fr: string };
  code: string;
  isActive?: boolean;
}

export interface UpdateColorInput {
  name?: { en?: string; fr?: string };
  code?: string;
  isActive?: boolean;
}
